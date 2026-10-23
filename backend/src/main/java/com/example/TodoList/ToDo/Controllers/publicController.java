package com.example.TodoList.ToDo.Controllers;

import com.example.TodoList.ToDo.Model.User;
import com.example.TodoList.ToDo.Service.UserService;
import com.example.TodoList.ToDo.Utils.JwtUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/public")
@Slf4j
public class publicController {

    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    private UserService userService;
    @Autowired
    JwtUtils jwtUtils;
    @Autowired
    UserDetailsService userDetailsService;
    @GetMapping("/health-check")
    public String health(){
        return "OK";
    }

    @PostMapping("/login")
    public ResponseEntity<?>login(@RequestBody User user){
        try{
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUserName(),user.getPassword())
            );
           UserDetails userDetails=userDetailsService.loadUserByUsername(user.getUserName());
           String jwt= jwtUtils.generateToken(userDetails.getUsername());
           return new ResponseEntity<>(jwt,HttpStatus.OK);
        }catch(Exception e){
            log.error("Something went wrong while logging the user",e);
            return new ResponseEntity<>("Incorrect username or password",HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/register-user")
    public ResponseEntity<User> createNewUser(@RequestBody User user){
        if (user.getUserName() == null || user.getUserName().isBlank()
                || user.getPassword() == null || user.getPassword().isBlank()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        if (userService.findByName(user.getUserName()) != null) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }
        // Copy only the fields a person may choose. Saving the request body as-is would let a caller
        // set an id (replacing an existing account) or a list of tasks.
        User fresh = new User();
        fresh.setUserName(user.getUserName());
        fresh.setEmail(user.getEmail());
        fresh.setPassword(user.getPassword());
        try{
            User saved=userService.saveNewUser(fresh);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        }catch (DuplicateKeyException e){
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }
    }

}
