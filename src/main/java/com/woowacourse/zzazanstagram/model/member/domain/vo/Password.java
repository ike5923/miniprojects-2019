package com.woowacourse.zzazanstagram.model.member.domain.vo;

import com.woowacourse.zzazanstagram.model.member.exception.MemberPasswordFormatException;
import org.mindrot.jbcrypt.BCrypt;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import java.util.Objects;

@Embeddable
public class Password {
    private static final String PASSWORD_REGEX = ".*(?=^.{8,}$)(?=.*\\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*";

    @Column(name = "password")
    private String password;

    private Password() {
    }

    private Password(final String password) {
        this.password = validate(password);
    }

    public static Password of(final String password) {
        return new Password(password);
    }

    private String validate(final String password) {
        if (isMismatch(password)) {
            throw new MemberPasswordFormatException("잘못된 형식의 비밀번호입니다.");
        }
        return encrypt(password);
    }

    private boolean isMismatch(String password) {
        return !password.matches(PASSWORD_REGEX);
    }

    private String encrypt(String password) {
        return Encrypt.encrypt(password);
    }

    public boolean isMatch(String password) {
        return Encrypt.isMatch(password, this.password);
    }

    public String getPassword() {
        return password;
    }

    private static class Encrypt {
        static String encrypt(String password) {
            return BCrypt.hashpw(password, BCrypt.gensalt());
        }

        static boolean isMatch(String password, String hashed) {
            return BCrypt.checkpw(password, hashed);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Password password1 = (Password) o;
        return Objects.equals(password, password1.password);
    }

    @Override
    public int hashCode() {
        return Objects.hash(password);
    }
}
