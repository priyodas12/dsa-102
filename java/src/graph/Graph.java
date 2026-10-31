package graph;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.PriorityQueue;
import java.util.Queue;
import java.util.Set;

/** An undirected, weighted graph on vertices 0..n-1 as an adjacency list. Mirrors web/topics/graph/steps.js. */
public class Graph {
    public static final int INF = Integer.MAX_VALUE;

    private record Edge(int to, int weight) {}

    private final List<List<Edge>> adj = new ArrayList<>();

    public Graph(int vertices) {
        for (int i = 0; i < vertices; i++) adj.add(new ArrayList<>());
    }

    public int vertices() {
        return adj.size();
    }

    /** O(1): store the edge in both lists because it is undirected. */
    public void addEdge(int a, int b, int weight) {
        adj.get(a).add(new Edge(b, weight));
        adj.get(b).add(new Edge(a, weight));
    }

    /** O(degree): each list has to be scanned. */
    public void removeEdge(int a, int b) {
        adj.get(a).removeIf(e -> e.to == b);
        adj.get(b).removeIf(e -> e.to == a);
    }

    /** O(V + E): vertices in order of distance (in hops) from start. */
    public List<Integer> bfs(int start) {
        List<Integer> order = new ArrayList<>();
        Set<Integer> seen = new HashSet<>();
        Queue<Integer> queue = new ArrayDeque<>();
        seen.add(start);
        queue.add(start);
        while (!queue.isEmpty()) {
            int v = queue.remove();
            order.add(v);
            for (Edge e : adj.get(v)) {
                if (seen.add(e.to)) queue.add(e.to); // mark when queued, not when removed
            }
        }
        return order;
    }

    /** O(V + E): go as deep as possible, then backtrack. */
    public List<Integer> dfs(int start) {
        List<Integer> order = new ArrayList<>();
        dfs(start, new HashSet<>(), order);
        return order;
    }

    private void dfs(int v, Set<Integer> seen, List<Integer> order) {
        seen.add(v);
        order.add(v);
        for (Edge e : adj.get(v)) {
            if (!seen.contains(e.to)) dfs(e.to, seen, order);
        }
    }

    /** O((V + E) log V). Weights must be non-negative. Unreachable vertices stay at INF. */
    public int[] dijkstra(int source) {
        int[] dist = new int[vertices()];
        Arrays.fill(dist, INF);
        dist[source] = 0;
        PriorityQueue<int[]> pq = new PriorityQueue<>((x, y) -> Integer.compare(x[1], y[1]));
        pq.add(new int[] {source, 0});
        while (!pq.isEmpty()) {
            int[] top = pq.remove(); // the closest vertex not yet finished
            if (top[1] > dist[top[0]]) continue; // stale entry: a shorter path was found later
            for (Edge e : adj.get(top[0])) {
                int d = top[1] + e.weight;
                if (d < dist[e.to]) {
                    dist[e.to] = d;
                    pq.add(new int[] {e.to, d});
                }
            }
        }
        return dist;
    }

    /** Interview problem (LeetCode 323): number of connected components. O(V + E). */
    public int countComponents() {
        Set<Integer> seen = new HashSet<>();
        int count = 0;
        for (int v = 0; v < vertices(); v++) {
            if (seen.contains(v)) continue;
            count++; // an unexplored vertex means a new component
            dfs(v, seen, new ArrayList<>());
        }
        return count;
    }
}
