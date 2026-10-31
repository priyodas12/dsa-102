package tree;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;

/** A binary search tree of ints with no duplicates. Mirrors web/topics/tree/steps.js. */
public class BinarySearchTree {
    private static class Node {
        int value;
        Node left, right;

        Node(int value) {
            this.value = value;
        }
    }

    private Node root;

    /** O(h): h is about log n if balanced, n if the tree is a chain. */
    public void insert(int value) {
        root = insert(root, value);
    }

    private Node insert(Node node, int value) {
        if (node == null) return new Node(value);
        if (value < node.value) node.left = insert(node.left, value);
        else if (value > node.value) node.right = insert(node.right, value);
        return node; // equal: already present
    }

    public boolean contains(int target) {
        Node node = root;
        while (node != null) {
            if (target == node.value) return true;
            node = target < node.value ? node.left : node.right;
        }
        return false;
    }

    public void delete(int value) {
        root = delete(root, value);
    }

    private Node delete(Node node, int value) {
        if (node == null) return null;
        if (value < node.value) node.left = delete(node.left, value);
        else if (value > node.value) node.right = delete(node.right, value);
        else {
            if (node.left == null) return node.right; // leaf or one child
            if (node.right == null) return node.left;
            Node next = node.right; // two children: in-order successor
            while (next.left != null) next = next.left;
            node.value = next.value;
            node.right = delete(node.right, next.value);
        }
        return node;
    }

    public int height() {
        return height(root);
    }

    private int height(Node node) {
        return node == null ? 0 : 1 + Math.max(height(node.left), height(node.right));
    }

    public List<Integer> inorder() {
        List<Integer> out = new ArrayList<>();
        inorder(root, out);
        return out;
    }

    private void inorder(Node node, List<Integer> out) {
        if (node == null) return;
        inorder(node.left, out);
        out.add(node.value); // visit between the children
        inorder(node.right, out);
    }

    public List<Integer> preorder() {
        List<Integer> out = new ArrayList<>();
        preorder(root, out);
        return out;
    }

    private void preorder(Node node, List<Integer> out) {
        if (node == null) return;
        out.add(node.value); // visit before the children
        preorder(node.left, out);
        preorder(node.right, out);
    }

    public List<Integer> postorder() {
        List<Integer> out = new ArrayList<>();
        postorder(root, out);
        return out;
    }

    private void postorder(Node node, List<Integer> out) {
        if (node == null) return;
        postorder(node.left, out);
        postorder(node.right, out);
        out.add(node.value); // visit after the children
    }

    public List<Integer> levelOrder() {
        List<Integer> out = new ArrayList<>();
        Queue<Node> queue = new ArrayDeque<>();
        if (root != null) queue.add(root);
        while (!queue.isEmpty()) {
            Node node = queue.remove();
            out.add(node.value);
            if (node.left != null) queue.add(node.left);
            if (node.right != null) queue.add(node.right);
        }
        return out;
    }

    /** Interview problem (LeetCode 235): lowest common ancestor. O(h) time, O(1) space. */
    public Integer lca(int p, int q) {
        Node node = root;
        while (node != null) {
            if (p < node.value && q < node.value) node = node.left;
            else if (p > node.value && q > node.value) node = node.right;
            else return node.value; // the paths split here (or one of them is this node)
        }
        return null;
    }
}
