package com.kaamgar.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "notifications")
public class Notification {

    @Id private String id;
    private String  userId;
    private String  ntype    = "info";
    private String  title;
    private String  body     = "";
    private String  link     = "";
    private boolean isRead   = false;

    @CreatedDate private Instant createdAt;

    public Notification() {}

    public String  getId()                    { return id; }
    public void    setId(String id)           { this.id = id; }
    public String  getUserId()                { return userId; }
    public void    setUserId(String u)        { this.userId = u; }
    public String  getNtype()                 { return ntype; }
    public void    setNtype(String n)         { this.ntype = n; }
    public String  getTitle()                 { return title; }
    public void    setTitle(String t)         { this.title = t; }
    public String  getBody()                  { return body; }
    public void    setBody(String b)          { this.body = b; }
    public String  getLink()                  { return link; }
    public void    setLink(String l)          { this.link = l; }
    public boolean isRead()                   { return isRead; }
    public void    setRead(boolean r)         { this.isRead = r; }
    public Instant getCreatedAt()             { return createdAt; }
    public void    setCreatedAt(Instant c)    { this.createdAt = c; }
}
