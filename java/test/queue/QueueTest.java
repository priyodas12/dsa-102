package queue;

import static org.junit.jupiter.api.Assertions.*;

import java.util.NoSuchElementException;
import org.junit.jupiter.api.Test;

class QueueTest {
    @Test
    void firstInFirstOut() {
        ArrayQueue q = new ArrayQueue(3);
        q.enqueue(1);
        q.enqueue(2);
        assertEquals(1, q.peek());
        assertEquals(1, q.dequeue());
        assertEquals(2, q.dequeue());
        assertTrue(q.isEmpty());
    }

    @Test
    void wrapsAroundAndReusesSlots() {
        ArrayQueue q = new ArrayQueue(2);
        for (int round = 0; round < 5; round++) {
            q.enqueue(round);
            q.enqueue(round + 100);
            assertEquals(round, q.dequeue());
            assertEquals(round + 100, q.dequeue());
        }
    }

    @Test
    void overflowAndUnderflow() {
        ArrayQueue q = new ArrayQueue(1);
        assertThrows(NoSuchElementException.class, q::dequeue);
        assertThrows(NoSuchElementException.class, q::peek);
        q.enqueue(1);
        assertThrows(IllegalStateException.class, () -> q.enqueue(2));
    }

    @Test
    void hotPotato() {
        assertEquals(4, HotPotato.lastSurvivor(5, 3));
        assertEquals(4, HotPotato.lastSurvivor(7, 3));
        assertEquals(1, HotPotato.lastSurvivor(1, 5));
        assertEquals(4, HotPotato.lastSurvivor(4, 1));
    }
}
