/*import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { getLocalItems } from './offlineQueue';

const HomePage = ({
    items,
    setItems,
    search,
    setSearch,
    filterStyle,
    setFilterStyle,
    filterCategory,
    setFilterCategory,
    sortPrice,
    setSortPrice,
    styles,
    categories,
    isOnline,
    serverAvailable
}) => {
    const [displayedItemsCount, setDisplayedItemsCount] = useState(6); // Start with 6 items
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);
    const requestRef = useRef();
    const prevScrollPos = useRef(0);

    // Filter and sort items
    const filteredItems = useMemo(() => {
        let result = [...items];

        // Apply style and category filters
        if (filterStyle) {
            result = result.filter(item => item.style === filterStyle);
        }
        if (filterCategory) {
            result = result.filter(item => item.category === filterCategory);
        }

        // Apply search filter
        if (search) {
            const searchTerm = search.toLowerCase();
            result = result.filter(item =>
                item.name.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm)
            );
        }

        // Apply sorting
        if (sortPrice === 'asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortPrice === 'desc') {
            result.sort((a, b) => b.price - a.price);
        }

        return result;
    }, [items, search, sortPrice, filterStyle, filterCategory]);

    // Get currently displayed items (circular logic)
    const displayedItems = useMemo(() => {
        if (filteredItems.length === 0) return [];

        const result = [];
        for (let i = 0; i < displayedItemsCount; i++) {
            const index = i % filteredItems.length;
            result.push(filteredItems[index]);
        }
        return result;
    }, [filteredItems, displayedItemsCount]);

    // Handle scroll to load more
    const handleScroll = useCallback(() => {
        if (!containerRef.current || loading) return;

        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const scrollingDown = scrollTop > prevScrollPos.current;
        prevScrollPos.current = scrollTop;

        if (scrollingDown && scrollHeight - scrollTop <= clientHeight + 100) {
            setLoading(true);
            requestRef.current = requestAnimationFrame(() => {
                setDisplayedItemsCount(prev => prev + 3);
                setLoading(false);
            });
        }
    }, [loading]);

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams();
                if (filterStyle) query.append("style", filterStyle);
                if (filterCategory) query.append("category", filterCategory);
                if (sortPrice) query.append("sortPrice", sortPrice);

                if (isOnline && serverAvailable) {
                    const res = await fetch(`http://localhost:4000/items?${query.toString()}`);
                    const data = await res.json();
                    const local = getLocalItems();
                    setItems([...data, ...local]); // Combine online + local
                } else {
                    const local = getLocalItems();
                    setItems(local); // Use local only
                }

                setDisplayedItemsCount(6); // Reset to initial count
            } catch (err) {
                console.error("Failed to fetch items:", err);
                const local = getLocalItems();
                setItems(local); // Fallback if fetch fails
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [filterStyle, filterCategory, sortPrice, isOnline, serverAvailable, setItems]);


    const getBackgroundColor = (price) => {
        if (filteredItems.length === 0) return 'white';

        const prices = filteredItems.map(item => item.price);
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

        if (price === maxPrice) return '#EFC3CA';
        if (price === minPrice) return '#C1F8FA';
        if (Math.abs(price - avgPrice) < 1) return '#B7B7B7';
        return 'white';
    };

    const handleDownloadVideo = async (productId, videoName) => {
        try {
            const response = await fetch(`http://localhost:4000/api/products/${productId}/video/download`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = videoName || `${productId}.mp4`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error downloading video:', error);
        }
    };

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{ overflowY: "auto", height: "80vh", position: "relative" }}
        >
            <h2>Home Page ({filteredItems.length} items)</h2>

            <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: "10px", padding: "8px", width: "300px" }}
            />

            <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                <div>
                    <h3>Filter by Style:</h3>
                    <select
                        value={filterStyle}
                        onChange={(e) => setFilterStyle(e.target.value)}
                        style={{ padding: "5px" }}
                    >
                        <option value="">All Styles</option>
                        {styles.map((style) => (
                            <option key={style} value={style}>{style}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <h3>Filter by Category:</h3>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        style={{ padding: "5px" }}
                    >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <h3>Sort by Price:</h3>
                    <select
                        value={sortPrice}
                        onChange={(e) => setSortPrice(e.target.value)}
                        style={{ padding: "5px" }}
                    >
                        <option value="">Default</option>
                        <option value="asc">Low to High</option>
                        <option value="desc">High to Low</option>
                    </select>
                </div>
            </div>

            <div className="item-list" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "20px"
            }}>
                {displayedItems.map((item, index) => (
                    <div
                        key={`${item.id}-${index}`}
                        className="jewelry-card"
                        style={{
                            backgroundColor: getBackgroundColor(item.price),
                            padding: "15px",
                            borderRadius: "8px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                        }}
                    >
                        <h3 style={{ marginTop: 0 }}>{item.name}</h3>
                        <p>{item.description}</p>
                        <p><strong>Style:</strong> {item.style}</p>
                        <p><strong>Category:</strong> {item.category}</p>
                        <p><strong>Price:</strong> ${item.price.toFixed(2)}</p>
                        {item.userAdded && <p style={{ color: "green" }}>Your item</p>}
                        {item.video && (
                            <div style={{ margin: "10px 0" }}>
                                <video
                                    controls
                                    width="100%"
                                    src={`http://localhost:4000/api/products/${item.id}/video`}
                                    style={{ borderRadius: "8px" }}
                                />
                                <button
                                    onClick={() => handleDownloadVideo(item.id, item.video)}
                                    style={{
                                        marginTop: "5px",
                                        padding: "5px 10px",
                                        backgroundColor: "#4CAF50",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        width: "100%"
                                    }}
                                >
                                    Download Video
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {loading && (
                <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                    Loading more items...
                </div>
            )}
        </div>
    );
};

export default HomePage;*/

import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { getLocalItems } from '../utils/offlineQueue.js';

const HomePage = ({
    items,
    setItems,
    search,
    setSearch,
    filterStyle,
    setFilterStyle,
    filterCategory,
    setFilterCategory,
    sortPrice,
    setSortPrice,
    styles,
    categories,
    isOnline,
    serverAvailable
}) => {
    const [displayedItemsCount, setDisplayedItemsCount] = useState(6); // Start with 6 items
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);
    const requestRef = useRef();
    const prevScrollPos = useRef(0);

    // Filter and sort items
    const filteredItems = useMemo(() => {
        let result = [...items];

        // Apply style and category filters
        if (filterStyle) {
            result = result.filter(item => item.style === filterStyle);
        }
        if (filterCategory) {
            result = result.filter(item => item.category === filterCategory);
        }

        // Apply search filter
        if (search) {
            const searchTerm = search.toLowerCase();
            result = result.filter(item =>
                item.name.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm)
            );
        }

        // Apply sorting
        if (sortPrice === 'asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortPrice === 'desc') {
            result.sort((a, b) => b.price - a.price);
        }

        return result;
    }, [items, search, sortPrice, filterStyle, filterCategory]);

    // Get currently displayed items (circular logic)
    const displayedItems = useMemo(() => {
        if (filteredItems.length === 0) return [];

        const result = [];
        for (let i = 0; i < displayedItemsCount; i++) {
            const index = i % filteredItems.length;
            result.push(filteredItems[index]);
        }
        return result;
    }, [filteredItems, displayedItemsCount]);

    // Handle scroll to load more
    const handleScroll = useCallback(() => {
        if (!containerRef.current || loading) return;

        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const scrollingDown = scrollTop > prevScrollPos.current;
        prevScrollPos.current = scrollTop;

        if (scrollingDown && scrollHeight - scrollTop <= clientHeight + 100) {
            setLoading(true);
            requestRef.current = requestAnimationFrame(() => {
                setDisplayedItemsCount(prev => prev + 3);
                setLoading(false);
            });
        }
    }, [loading]);

    useEffect(() => {
        if (items.length === 0) {
            const local = getLocalItems();
            setItems(local);
        }
    }, [items, setItems]);


    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams();
                if (filterStyle) query.append("style", filterStyle);
                if (filterCategory) query.append("category", filterCategory);
                if (sortPrice) query.append("sortPrice", sortPrice);

                if (isOnline && serverAvailable) {
                    const res = await fetch(`http://localhost:4000/items?${query.toString()}`);
                    const data = await res.json();
                    const local = getLocalItems();
                    setItems([...data, ...local]); // Combine online + local
                } else {
                    const local = getLocalItems();
                    setItems(local); // Use local only
                }

                setDisplayedItemsCount(6); // Reset to initial count
            } catch (err) {
                console.error("Failed to fetch items:", err);
                const local = getLocalItems();
                setItems(local); // Fallback if fetch fails
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [filterStyle, filterCategory, sortPrice, isOnline, serverAvailable, setItems]);


    const getBackgroundColor = (price) => {
        if (filteredItems.length === 0) return 'white';

        const prices = filteredItems.map(item => item.price);
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

        if (price === maxPrice) return '#EFC3CA';
        if (price === minPrice) return '#C1F8FA';
        if (Math.abs(price - avgPrice) < 1) return '#B7B7B7';
        return 'white';
    };

    const handleDownloadVideo = async (productId, videoName) => {
        try {
            const response = await fetch(`https://jewelry-website-backend-mt8c.onrender.com/api/products/${productId}/video/download`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = videoName || `${productId}.mp4`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error downloading video:', error);
        }
    };

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{ overflowY: "auto", height: "80vh", position: "relative" }}
        >
            <h2>Home Page</h2>

            <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: "10px", padding: "8px", width: "300px" }}
            />

            <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                <div>
                    <h3>Filter by Style:</h3>
                    <select
                        value={filterStyle}
                        onChange={(e) => setFilterStyle(e.target.value)}
                        style={{ padding: "5px" }}
                    >
                        <option value="">All Styles</option>
                        {styles.map((style) => (
                            <option key={style} value={style}>{style}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <h3>Filter by Category:</h3>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        style={{ padding: "5px" }}
                    >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <h3>Sort by Price:</h3>
                    <select
                        value={sortPrice}
                        onChange={(e) => setSortPrice(e.target.value)}
                        style={{ padding: "5px" }}
                    >
                        <option value="">Default</option>
                        <option value="asc">Low to High</option>
                        <option value="desc">High to Low</option>
                    </select>
                </div>
            </div>

            <div className="item-list" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "20px"
            }}>
                {displayedItems.map((item, index) => (
                    <div
                        key={`${item.id}-${index}`}
                        className="jewelry-card"
                        style={{
                            backgroundColor: getBackgroundColor(item.price),
                            padding: "15px",
                            borderRadius: "8px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                        }}
                    >
                        <h3 style={{ marginTop: 0 }}>{item.name}</h3>
                        <p>{item.description}</p>
                        <p><strong>Style:</strong> {item.style}</p>
                        <p><strong>Category:</strong> {item.category}</p>
                        <p><strong>Price:</strong> ${item.price.toFixed(2)}</p>
                        {item.userAdded && <p style={{ color: "green" }}>Your item</p>}
                        {item.video && (
                            <div style={{ margin: "10px 0" }}>
                                <video
                                    controls
                                    width="100%"
                                    src={`https://jewelry-website-backend-mt8c.onrender.com/api/products/${item.id}/video`}
                                    style={{ borderRadius: "8px" }}
                                />
                                <button
                                    onClick={() => handleDownloadVideo(item.id, item.video)}
                                    style={{
                                        marginTop: "5px",
                                        padding: "5px 10px",
                                        backgroundColor: "#4CAF50",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        width: "100%"
                                    }}
                                >
                                    Download Video
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {loading && (
                <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                    Loading more items...
                </div>
            )}
        </div>
    );
};

export default HomePage;
