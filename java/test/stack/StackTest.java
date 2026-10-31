package stack;

import static org.junit.jupiter.api.Assertions.*;

import java.util.EmptyStackException;
import org.junit.jupiter.api.Test;

class StackTest {
    @Test
    void popReturnsLastPushedFirst() {
        ArrayStack s = new ArrayStack(3);
        s.push(1);
        s.push(2);
        assertEquals(2, s.peek());
        assertEquals(2, s.pop());
        assertEquals(1, s.pop());
        assertTrue(s.isEmpty());
    }

    @Test
    void overflowAndUnderflow() {
        ArrayStack s = new ArrayStack(1);
        assertThrows(EmptyStackException.class, s::pop);
        assertThrows(EmptyStackException.class, s::peek);
        s.push(1);
        assertThrows(StackOverflowError.class, () -> s.push(2));
    }

    @Test
    void balancedBrackets() {
        assertTrue(Brackets.isBalanced("{[()]}"));
        assertTrue(Brackets.isBalanced(""));
        assertFalse(Brackets.isBalanced("(("));
        assertFalse(Brackets.isBalanced(")"));
        assertFalse(Brackets.isBalanced("(]"));
        assertFalse(Brackets.isBalanced("([)]"));
    }
}
