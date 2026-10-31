package tree;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import org.junit.jupiter.api.Test;

class BinarySearchTreeTest {
    private static BinarySearchTree sample() {
        BinarySearchTree t = new BinarySearchTree();
        for (int v : new int[] {50, 30, 70, 20, 40, 60, 80}) t.insert(v);
        return t;
    }

    @Test
    void traversals() {
        BinarySearchTree t = sample();
        assertEquals(List.of(20, 30, 40, 50, 60, 70, 80), t.inorder());
        assertEquals(List.of(50, 30, 20, 40, 70, 60, 80), t.preorder());
        assertEquals(List.of(20, 40, 30, 60, 80, 70, 50), t.postorder());
        assertEquals(List.of(50, 30, 70, 20, 40, 60, 80), t.levelOrder());
    }

    @Test
    void insertIgnoresDuplicatesAndContainsWorks() {
        BinarySearchTree t = sample();
        t.insert(50);
        assertEquals(7, t.inorder().size());
        assertTrue(t.contains(60));
        assertFalse(t.contains(65));
        assertFalse(new BinarySearchTree().contains(1));
    }

    @Test
    void deleteLeafOneChildTwoChildrenAndRoot() {
        BinarySearchTree t = sample();
        t.delete(20); // leaf
        assertEquals(List.of(30, 40, 50, 60, 70, 80), t.inorder());
        t.delete(30); // one child now
        assertEquals(List.of(40, 50, 60, 70, 80), t.inorder());
        t.delete(70); // two children
        assertEquals(List.of(40, 50, 60, 80), t.inorder());
        t.delete(50); // root
        assertEquals(List.of(40, 60, 80), t.inorder());
        t.delete(99); // missing
        assertEquals(3, t.inorder().size());
    }

    @Test
    void sortedInsertsMakeAChain() {
        BinarySearchTree t = new BinarySearchTree();
        for (int i = 1; i <= 5; i++) t.insert(i);
        assertEquals(5, t.height());
    }

    @Test
    void lowestCommonAncestor() {
        BinarySearchTree t = sample();
        assertEquals(30, t.lca(20, 40));
        assertEquals(50, t.lca(20, 80));
        assertEquals(30, t.lca(30, 40));
    }
}
