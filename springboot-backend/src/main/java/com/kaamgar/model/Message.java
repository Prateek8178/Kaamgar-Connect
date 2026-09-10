package com.kaamgar.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "messages")
public class Message {

    @Id
    private String id;
    private String roomId;
    private String senderId;
    private String text;
    private Boolean isRead = false;

    @CreatedDate
    private Instant createdAt;

    public Message() {}

    public String getId()                  { return id; }
    public void   setId(String id)         { this.id = id; }
    public String getRoomId()              { return roomId; }
    public void   setRoomId(String r)      { this.roomId = r; }
    public String getSenderId()            { return senderId; }
    public void   setSenderId(String s)    { this.senderId = s; }
    public String getText()                { return text; }
    public void   setText(String t)        { this.text = t; }
    public Boolean getIsRead()             { return isRead; }
    public void   setIsRead(Boolean r)     { this.isRead = r; }
    public Instant getCreatedAt()          { return createdAt; }
    public void   setCreatedAt(Instant c)  { this.createdAt = c; }
}
