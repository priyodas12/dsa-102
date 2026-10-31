package graph;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import org.junit.jupiter.api.Test;

class GraphTest {
    // A=0 .. F=5, plus G=6 and H=7 connected only to each other.
    private static Graph sample() {
        Graph g = new Graph(8);
        int[][] edges = {{0, 1, 4}, {0, 2, 2}, {1, 2, 1}, {1, 3, 5}, {2, 3, 8}, {2, 4, 10}, {3, 4, 2}, {3, 5, 6}, {4, 5, 3}, {6, 7, 1}};
        for (int[] e : edges) g.addEdge(e[0], e[1], e[2]);
        return g;
    }

    @Test
    void bfsVisitsInRingsAndStaysInItsComponent() {
        assertEquals(List.of(0, 1, 2, 3, 4, 5), sample().bfs(0));
        assertEquals(List.of(7, 6), sample().bfs(7));
    }

    @Test
    void dfsGoesDeepFirst() {
        Graph g = new Graph(5);
        g.addEdge(0, 1, 1);
        g.addEdge(0, 2, 1);
        g.addEdge(1, 3, 1);
        g.addEdge(2, 4, 1);
        assertEquals(List.of(0, 1, 3, 2, 4), g.dfs(0));
        assertEquals(List.of(0, 1, 2, 3, 4), g.bfs(0));
    }

    @Test
    void searchesTerminateOnACycle() {
        Graph g = new Graph(3);
        g.addEdge(0, 1, 1);
        g.addEdge(1, 2, 1);
        g.addEdge(2, 0, 1);
        assertEquals(3, g.bfs(0).size());
        assertEquals(3, g.dfs(0).size());
    }

    @Test
    void dijkstraFindsCheapestPaths() {
        int[] dist = sample().dijkstra(0);
        assertArrayEquals(new int[] {0, 3, 2, 8, 10, 13, Graph.INF, Graph.INF}, dist);
    }

    @Test
    void removeEdgeChangesPathsAndComponents() {
        Graph g = sample();
        assertEquals(2, g.countComponents());
        g.removeEdge(6, 7);
        assertEquals(3, g.countComponents());
        g.removeEdge(0, 2);
        assertEquals(Graph.INF, g.dijkstra(6)[0]);
        assertEquals(4, g.dijkstra(0)[1]);
    }

    @Test
    void isolatedVerticesAreTheirOwnComponents() {
        assertEquals(4, new Graph(4).countComponents());
    }
}
