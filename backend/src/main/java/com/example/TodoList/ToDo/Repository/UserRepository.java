package com.example.TodoList.ToDo.Repository;

import com.example.TodoList.ToDo.Model.User;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, ObjectId> {
    User getUserByUserName(String userName);
}
