package com.example.TodoList.ToDo.Service;

import com.example.TodoList.ToDo.Model.Todo;
import com.example.TodoList.ToDo.Model.User;
import com.example.TodoList.ToDo.Repository.TodoRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;

/**
 * Rules for tasks. Failures are reported with standard exceptions so the controller can pick the
 * right status code:
 *   NoSuchElementException    - the task doesn't exist, or it isn't the caller's  (404)
 *   IllegalStateException     - the task is on a past day and can't be changed     (400)
 *   IllegalArgumentException  - the request itself is not valid, e.g. empty text   (400)
 */
@Service
public class TodoService {

        @Autowired
        private UserService userService;
        @Autowired
        private TodoRepository todoRepository;

        public Todo createTodo(String userName, Todo todo,LocalDate date) throws Exception{
            User user = userService.findByName(userName);
            if (user == null) {
                throw new RuntimeException("User not found: " + userName);
            }
            String content = cleanContent(todo == null ? null : todo.getContent());
            LocalDate targetDate=(date!=null)?date:LocalDate.now();
            if(targetDate.isBefore(LocalDate.now()))throw new IllegalStateException("You are not allow to create this todo on this date");

            // Build a new task from the text only. Saving the request body as-is would let a caller
            // send an existing id and overwrite someone else's task.
            Todo fresh = new Todo();
            fresh.setContent(content);
            fresh.setDate(targetDate);
            Todo savedTodo = todoRepository.save(fresh);

            if (user.getTodos() == null) {
                user.setTodos(new ArrayList<>());
            }
            user.getTodos().add(savedTodo);
            userService.saveUser(user);
            return savedTodo;
        }

        public List<Todo> getTodosByDate(String userName, LocalDate date)throws Exception{
            User user=userService.findByName(userName);
            if(user==null){
                throw new Exception("User not found");
            }
            if (user.getTodos() == null) {
                return Collections.emptyList();
            }

            return user.getTodos().stream()
                    .filter(Objects::nonNull)
                    .filter(todo -> todo.getDate() != null)
                    .filter(todo -> todo.getDate().equals(date))
                    .toList();
        }

        public void deleteTodo(ObjectId id,User user){
            Todo todo = findOwned(id, user);
            if(isPast(todo)){
                throw new IllegalStateException("Older todos can not be deleted");
            }
            user.getTodos().removeIf(t -> t != null && id.equals(t.getId()));
            userService.saveUser(user);
            todoRepository.deleteById(id);
        }

        public List<Todo>getAllTodosOfUser(User user){
            if (user == null || user.getTodos() == null) {
                return Collections.emptyList();
            }
            return user.getTodos().stream().filter(Objects::nonNull).toList();
        }

        //edit todo
        public Todo updateTodo(ObjectId id, String content, User user) {
            Todo todo = findOwned(id, user);
            String text = cleanContent(content);
            if(isPast(todo))throw new IllegalStateException("you can not update the past todos");
            todo.setContent(text);
            return todoRepository.save(todo);
        }

        //mark check or uncheck
        public Todo markTodo(ObjectId id, User user) {
            Todo todo = findOwned(id, user);
            // treat null as false
            boolean currentStatus = Boolean.TRUE.equals(todo.getCompleted());
            todo.setCompleted(!currentStatus);
            return todoRepository.save(todo);
        }

        // The task, but only if it is in this user's list. Other people's tasks look like they don't exist.
        private Todo findOwned(ObjectId id, User user) {
            boolean owned = user != null
                    && user.getTodos() != null
                    && user.getTodos().stream().anyMatch(t -> t != null && id.equals(t.getId()));
            if (!owned) {
                throw new NoSuchElementException("Todo not found");
            }
            return todoRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Todo not found"));
        }

        private static boolean isPast(Todo todo) {
            return todo.getDate() != null && todo.getDate().isBefore(LocalDate.now());
        }

        private static String cleanContent(String content) {
            String text = content == null ? "" : content.trim();
            if (text.isEmpty()) {
                throw new IllegalArgumentException("A task needs some text");
            }
            return text;
        }
}
