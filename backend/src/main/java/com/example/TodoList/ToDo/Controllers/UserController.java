package com.example.TodoList.ToDo.Controllers;

import com.example.TodoList.ToDo.Model.User;
import com.example.TodoList.ToDo.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/User")
public class UserController {

    @Autowired
    private UserService userService;

    // The old GET /User/get-All-users endpoint was removed: it listed every account, with emails,
    // to any signed-in user.

    @GetMapping("/get-user")
    public ResponseEntity<User>getUserDetails(){
        Authentication authentication= SecurityContextHolder.getContext().getAuthentication();
        assert authentication != null;
        String userName=authentication.getName();
        User user=userService.findByName(userName);
        return new ResponseEntity<>(user,HttpStatus.OK);
    }


    @PutMapping("/editUser")
    public ResponseEntity<User>editUser(@RequestBody User user){
        try{
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userName = authentication.getName();
            User updatedUser = userService.updateUser(user, userName);
            return new ResponseEntity<>(updatedUser,HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}
