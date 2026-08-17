package com.blogverse.app.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "database_sequences")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DatabaseSequence {
    @Id
    private String id;
    private long seq;
}
