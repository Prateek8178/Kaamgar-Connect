package com.kaamgar.dto;

import com.kaamgar.model.User;

public class UserDto {
    private String id, username, email, firstName, lastName, fullName, role, phone, profilePhoto, city, bio;

    public UserDto() {}

    public static UserDto from(User u) {
        UserDto d = new UserDto();
        d.id = u.getId(); d.username = u.getUsername(); d.email = u.getEmail();
        d.firstName = u.getFirstName(); d.lastName = u.getLastName(); d.fullName = u.getFullName();
        d.role = u.getRole(); d.phone = u.getPhone(); d.profilePhoto = u.getProfilePhoto();
        d.city = u.getCity(); d.bio = u.getBio();
        return d;
    }

    public String getId()            { return id; }
    public String getUsername()      { return username; }
    public String getEmail()         { return email; }
    public String getFirstName()     { return firstName; }
    public String getLastName()      { return lastName; }
    public String getFullName()      { return fullName; }
    public String getRole()          { return role; }
    public String getPhone()         { return phone; }
    public String getProfilePhoto()  { return profilePhoto; }
    public String getCity()          { return city; }
    public String getBio()           { return bio; }
    public void   setId(String v)            { id = v; }
    public void   setUsername(String v)      { username = v; }
    public void   setEmail(String v)         { email = v; }
    public void   setFirstName(String v)     { firstName = v; }
    public void   setLastName(String v)      { lastName = v; }
    public void   setFullName(String v)      { fullName = v; }
    public void   setRole(String v)          { role = v; }
    public void   setPhone(String v)         { phone = v; }
    public void   setProfilePhoto(String v)  { profilePhoto = v; }
    public void   setCity(String v)          { city = v; }
    public void   setBio(String v)           { bio = v; }
}
