package com.example.TodoList.ToDo.Controllers;
import com.example.TodoList.ToDo.Model.Todo;
import com.example.TodoList.ToDo.Model.User;
import com.example.TodoList.ToDo.Service.TodoService;
import com.example.TodoList.ToDo.Service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/todos")
@Slf4j
public class TodoController {

    @Autowired
    private TodoService todoService;
    @Autowired
    private UserService userService;

    private User currentUser(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userService.findByName(authentication.getName());
    }

    // POST /todos/addTodo?date=2026-10-23   (date is optional and defaults to today)
    @PostMapping("/addTodo")
    public ResponseEntity<?>addTodo(
            @RequestParam(value = "date", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestBody Todo todo){
        try{
            Authentication authentication= SecurityContextHolder.getContext().getAuthentication();
            assert authentication != null;
            String userName=authentication.getName();
            Todo newTodo=todoService.createTodo(userName,todo,date);
            return new ResponseEntity<>(newTodo,HttpStatus.CREATED);
        }catch (Exception e){
            log.error("Error Occurred while adding the new todo",e);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }


    @GetMapping("/get-userTodo-byDate/{date}")
    public ResponseEntity<List<Todo>>getTodosByDate(
            @PathVariable("date")
            @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date){
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            assert authentication != null;
            String userName = authentication.getName();
            LocalDate targetDate = (date != null) ? date : LocalDate.now();
            List<Todo> todos = todoService.getTodosByDate(userName,targetDate);
            return new ResponseEntity<>(todos,HttpStatus.OK);
        } catch (UsernameNotFoundException e) {
            log.warn("User not found during todo lookup: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            log.error("Error while fetching todos", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/deleteTodo/{id}")
    public ResponseEntity<?>deleteTodoById(@PathVariable ObjectId id){
        try{
            todoService.deleteTodo(id, currentUser());
            return new ResponseEntity<>(HttpStatus.OK);
        }catch (NoSuchElementException e){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }catch (IllegalStateException | IllegalArgumentException e){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }catch (Exception e){
            log.error("Error while deleting todo", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/getAllTodo")
    public ResponseEntity<List<Todo>>getUserTodo(){
        List<Todo>todos=todoService.getAllTodosOfUser(currentUser());
        return new ResponseEntity<>(todos,HttpStatus.OK);
    }

    // The body is the new text itself, sent as plain text (not JSON).
    @PutMapping("/editTodo/{id}")
    public ResponseEntity<Todo> editTodo(@PathVariable ObjectId id,@RequestBody String content){
        try{
            Todo updated=todoService.updateTodo(id,content,currentUser());
            return new ResponseEntity<>(updated,HttpStatus.OK);
        }catch (NoSuchElementException e){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }catch (IllegalStateException | IllegalArgumentException e){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }catch (Exception e){
            log.error("Error while editing todo", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Flips a task between done and not done. It changes data, so it is a POST rather than a GET.
    @PostMapping("/markTodo/{id}")
    public ResponseEntity<Todo> markTodo(@PathVariable ObjectId id){
        try{
            Todo marked=todoService.markTodo(id,currentUser());
            return new ResponseEntity<>(marked,HttpStatus.OK);
        }catch (NoSuchElementException e){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }catch (Exception e){
            log.error("Error while marking todo", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
