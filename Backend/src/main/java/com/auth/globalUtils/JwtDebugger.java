package com.auth.globalUtils;

import java.util.Base64;

public class JwtDebugger {
    public static void decodeJWT(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            System.out.println("Invalid JWT token format.");
            return;
        }

        String header = new String(Base64.getDecoder().decode(parts[0]));
        String payload = new String(Base64.getDecoder().decode(parts[1]));

        System.out.println("Header:");
        System.out.println(header);

        System.out.println("\nPayload:");
        System.out.println(payload);
    }

    public static void main(String[] args) {
        String token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJrcmlzaG5hIiwiaWQiOjEsImlhdCI6MTc0NDkxMzQyMCwiZXhwIjoxNzQ0OTE3MDIwfQ.6ffDtwI191joKHygQEJ2uSOSDfRDs_-HGkJTN7rO_14"; // Paste your token here
        decodeJWT(token);
    }
}
