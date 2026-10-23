package com.example.TodoList.ToDo.Utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class JwtUtils {
    @Value("${jwt.secret:}")
    private String SECRET_KEY ;

    // Fail at startup with a clear message. Otherwise a missing or short secret only shows up
    // as an error the first time someone tries to sign in.
    @PostConstruct
    void checkSecret() {
        if (SECRET_KEY == null || SECRET_KEY.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET is missing or too short. Set it to at least 32 characters, "
                            + "for example the output of: openssl rand -base64 48");
        }
    }

    private SecretKey getSigningToken() {

        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }
    public String extractUserName(String token){
        Claims claims=getClaims(token);
        return claims.getSubject();
    }
    public Date extractExpiration(String Token){
        return getClaims(Token).getExpiration();
    }
    public boolean isTokenExpired(String token){
        return extractExpiration(token).before(new Date());
    }

    private Claims getClaims(String token){
        return Jwts.parser()
                .verifyWith(getSigningToken())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    public String generateToken(String userName){
        Map<String,ObjectId>claims=new HashMap<>();
        return CreateToken(claims,userName);
    }
    private String CreateToken(Map<String, ObjectId> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .header().empty().add("typ", "JWT")
                .and()
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 5))
                .signWith(getSigningToken())
                .compact();
    }
    public boolean isValidation(String token){
        return !isTokenExpired(token);
    }
}
