package com.woowacourse.zzazanstagram.model.member;

import java.io.Serializable;

public class MemberSession implements Serializable {
    private String email;
    private String nickName;
    private String profileImage;

    public MemberSession(String email, String nickName, String profileImage) {
        this.email = email;
        this.nickName = nickName;
        this.profileImage = profileImage;
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

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }
}