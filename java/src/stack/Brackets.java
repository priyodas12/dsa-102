package stack;

import java.util.ArrayDeque;
import java.util.Deque;

/** Interview problem: are the brackets balanced? O(n) time, O(n) space. */
public final class Brackets {
    private Brackets() {}

    public static boolean isBalanced(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if ("([{".indexOf(c) >= 0) {
                stack.push(c);
            } else if (")]}".indexOf(c) >= 0) {
                if (stack.isEmpty() || !matches(stack.pop(), c)) return false;
            }
        }
        return stack.isEmpty(); // leftover openers were never closed
    }

    private static boolean matches(char open, char close) {
        return "([{".indexOf(open) == ")]}".indexOf(close);
    }
}
