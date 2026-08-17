package com.blogverse.app.service;

import com.blogverse.app.model.DatabaseSequence;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import static org.springframework.data.mongodb.core.FindAndModifyOptions.options;
import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

/**
 * Auto-increment sequence generator for MongoDB documents.
 * Provides numeric IDs compatible with the frontend's number type expectations.
 */
@Service
@RequiredArgsConstructor
public class SequenceGeneratorService {

    private final MongoOperations mongoOperations;

    public long generateSequence(String seqName) {
        DatabaseSequence counter = mongoOperations.findAndModify(
                query(where("_id").is(seqName)),
                new Update().inc("seq", 1),
                options().returnNew(true).upsert(true),
                DatabaseSequence.class
        );
        return counter != null ? counter.getSeq() : 1;
    }

    // Sequence name constants
    public static final String USER_SEQ = "users_sequence";
    public static final String POST_SEQ = "posts_sequence";
    public static final String COMMENT_SEQ = "comments_sequence";
    public static final String NOTIFICATION_SEQ = "notifications_sequence";
}
