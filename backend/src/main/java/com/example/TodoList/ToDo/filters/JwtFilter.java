package com.example.TodoList.ToDo.filters;


import com.example.TodoList.ToDo.Utils.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Slf4j
public class JwtFilter extends OncePerRequestFilter {
    @Autowired
    private UserDetailsService userDetailsService;
    @Autowired
    JwtUtils jwtUtils;
    @Override
    protected void doFilterInternal(HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        String authorizationHeader =request.getHeader("Authorization");
        if(authorizationHeader !=null && authorizationHeader.startsWith("Bearer ")){
            String jwt= authorizationHeader.substring(7);
            try{
                String username=jwtUtils.extractUserName(jwt);
                if(username!=null){
                    UserDetails userDetails=userDetailsService.loadUserByUsername(username);
                    if(jwtUtils.isValidation(jwt)){
                        UsernamePasswordAuthenticationToken auth=new UsernamePasswordAuthenticationToken(userDetails,null,userDetails.getAuthorities());
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            }catch (RuntimeException e){
                // An expired, malformed or tampered token, or a user who no longer exists. Carry on
                // as an anonymous request: protected URLs then answer 401 instead of crashing with 500.
                log.debug("Ignoring invalid token: {}", e.getMessage());
            }
        }
        filterChain.doFilter(request,response);
    }
}
