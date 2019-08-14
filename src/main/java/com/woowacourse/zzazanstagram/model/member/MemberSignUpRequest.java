package com.woowacourse.zzazanstagram.model.member;

import javax.validation.constraints.NotBlank;

public class MemberSignUpRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String email;

    @NotBlank
    private String nickName;

    @NotBlank
    private String password;

    private String profile;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNickName() {
        return nickName;
    }

    public void setNickName(String nickName) {
        this.nickName = nickName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getProfile() {
        return profile;
    }

    public void setProfile(String profile) {
        this.profile = profile;
    }
}