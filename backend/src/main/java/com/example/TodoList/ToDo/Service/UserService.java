package com.example.TodoList.ToDo.Service;

import com.example.TodoList.ToDo.Model.User;
import com.example.TodoList.ToDo.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.*;
@Service
public class UserService {

    @Autowired
    private  PasswordEncoder passwordEncoder;
    @Autowired
    private UserRepository userRepository;

    public User saveNewUser(User user){
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
    public User saveUser(User user){
        return userRepository.save(user);
    }
    public List<User>getAllUser(){
        return userRepository.findAll();
    }
    public User findByName(String userName){
        return userRepository.getUserByUserName(userName);
    }
    //edit user
    public User updateUser(User user,String userName)throws Exception{
        User savedUser=findByName(userName);
        if(savedUser==null)throw new Exception("User with the userName does not exists");
        savedUser.setUserName(user.getUserName());
        savedUser.setPassword(passwordEncoder.encode(user.getPassword()));
        savedUser.setEmail(user.getEmail());
        return saveUser(savedUser);
    }
}
