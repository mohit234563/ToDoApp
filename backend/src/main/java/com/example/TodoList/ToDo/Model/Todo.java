package com.example.TodoList.ToDo.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import java.time.LocalDate;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class Todo {
    private ObjectId id;
    private String content;
    private LocalDate date;
    private Boolean completed=false;

    // Added for the frontend: Jackson writes an ObjectId as an object with no usable id inside,
    // so the task id is also sent as a plain string called "idHex". It has no field, so it is
    // not stored in MongoDB.
    public String getIdHex() {
        return id == null ? null : id.toHexString();
    }
}
