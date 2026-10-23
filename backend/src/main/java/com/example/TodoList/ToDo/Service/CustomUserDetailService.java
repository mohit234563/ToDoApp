package com.example.TodoList.ToDo.Service;

import com.example.TodoList.ToDo.Model.User;
import com.example.TodoList.ToDo.Repository.UserRepository;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;
    @Override
    public @NonNull UserDetails loadUserByUsername(@NonNull String userName)throws UsernameNotFoundException {
        User user=userRepository.getUserByUserName(userName);
        if(user==null){
            throw new UsernameNotFoundException("User not found with this name "+userName );
        }
        return org.springframework.security.core.userdetails.User
                .builder()
                .username(user.getUserName())
                .password(user.getPassword())
                .build();
    }
}
