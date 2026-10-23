package com.example.TodoList.ToDo.Controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * When the built frontend is packaged into this app (see the README), these are its page routes.
 * Opening or refreshing one of them directly should load the frontend, which then shows the right
 * page. Without the frontend files in place these simply answer 404.
 */
@Controller
public class SpaController {

    @GetMapping({"/login", "/signup", "/account", "/day/{date}"})
    public String frontendPage() {
        return "forward:/index.html";
    }
}
