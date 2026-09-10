package com.kaamgar.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "chatrooms")
public class ChatRoom {

    @Id private String id;
    private String workerId;
    private String employerId;

    @CreatedDate  private Instant createdAt;
    @LastModifiedDate private Instant updatedAt;

    public ChatRoom() {}

    public String  getId()                    { return id; }
    public void    setId(String id)           { this.id = id; }
    public String  getWorkerId()              { return workerId; }
    public void    setWorkerId(String w)      { this.workerId = w; }
    public String  getEmployerId()            { return employerId; }
    public void    setEmployerId(String e)    { this.employerId = e; }
    public Instant getCreatedAt()             { return createdAt; }
    public void    setCreatedAt(Instant c)    { this.createdAt = c; }
    public Instant getUpdatedAt()             { return updatedAt; }
    public void    setUpdatedAt(Instant u)    { this.updatedAt = u; }
}
