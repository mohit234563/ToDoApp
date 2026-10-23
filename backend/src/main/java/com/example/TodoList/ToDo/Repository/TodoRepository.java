package com.example.TodoList.ToDo.Repository;

import com.example.TodoList.ToDo.Model.Todo;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TodoRepository extends MongoRepository<Todo, ObjectId> {

}
