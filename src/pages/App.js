//!!!!silver + infinitescroll + offline setup

/*import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { syncQueue, getLocalItems, queueOperation } from './offlineQueue';
import HomePage from "./HomePage";
import YourPage from "./YourPage";
import Charts from "./Charts";
import "./App.css";

const API_URL = "http://localhost:4000";

const App = () => {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");
    const [filterStyle, setFilterStyle] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [sortPrice, setSortPrice] = useState("");
    const [newItem, setNewItem] = useState({ name: "", description: "", style: "", category: "", price: 0 });
    const [editing, setEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState("Home");
    const [editItem, setEditItem] = useState(null);
    const [socket, setSocket] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [serverAvailable, setServerAvailable] = useState(true);
    const [videoBuffer, setVideoBuffer] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);

    useEffect(() => {
        if (!videoBuffer) return; // Prevent error if undefined
        const blob = new Blob([videoBuffer], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);

        // Clean up the URL object when component unmounts or buffer changes
        return () => URL.revokeObjectURL(url);
    }, [videoBuffer]);


    const styles = ["punk", "grunge", "Y2K", "hippie", "classic", "modern"];
    const categories = ["earrings", "rings", "necklace", "piercing", "bracelets", "body chain"];

    useEffect(() => {
        if (videoBuffer) {
            const blob = new Blob([videoBuffer], { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);

            return () => URL.revokeObjectURL(url); // cleanup on unmount or change
        }
    }, [videoBuffer]);


    // Network status detection and server check
    useEffect(() => {
        const updateOnlineStatus = () => {
            const newStatus = navigator.onLine;
            setIsOnline(newStatus);
            if (newStatus) checkServerAvailability(); // Check server immediately when coming online
        };

        const checkServerAvailability = async () => {
            try {
                const res = await fetch(`${API_URL}/health`, {
                    signal: AbortSignal.timeout(3000) // Timeout after 3 seconds
                });
                setServerAvailable(res.ok);
            } catch (err) {
                setServerAvailable(false);
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        // Initial checks
        updateOnlineStatus(); // This will check both network and server status
        const interval = setInterval(checkServerAvailability, 10000);

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        const checkInternetConnection = async () => {
            try {
                // Pinging a reliable public URL (can use your server or a public site)
                const onlineCheck = await fetch("https://www.google.com/favicon.ico", {
                    method: "HEAD",
                    mode: "no-cors"
                });

                // If no error is thrown, assume online
                setIsOnline(true);
            } catch (err) {
                console.warn("No internet connection detected");
                setIsOnline(false);
            }
        };

        // Run once at start and then every 10 seconds
        checkInternetConnection();
        const interval = setInterval(checkInternetConnection, 10000);

        return () => clearInterval(interval);
    }, []);

     // WebSocket connection - only when properly online
    useEffect(() => {
        if (isOnline && serverAvailable) {
            const ws = new WebSocket(`ws://${API_URL.split('//')[1]}`);
            setSocket(ws);

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                console.log('WebSocket message received:', message);

                if (isOnline && serverAvailable) {
                    switch (message.type) {
                        case 'INITIAL_DATA':
                            setItems(prev => [...message.data, ...getLocalItems()]);
                            break;
                        case 'NEW_AUTO_ITEM':
                            setItems(prev => [...prev, message.data]);
                            break;
                        case 'NEW_ITEM':
                        case 'UPDATED_ITEM':
                        case 'DELETED_ITEM':
                            break;
                    }
                }
            };

            return () => ws.close();
        }
    }, [isOnline, serverAvailable]);

    // Fetch items with offline fallback
    const fetchItems = async () => {
        try {
            const query = new URLSearchParams();
            if (filterStyle) query.append("style", filterStyle);
            if (filterCategory) query.append("category", filterCategory);
            if (sortPrice) query.append("sortPrice", sortPrice);

            const res = await fetch(`${API_URL}/items?${query.toString()}`);
            const data = await res.json();
            setItems([...data, ...getLocalItems()]);
        } catch (err) {
            console.error("Failed to fetch items:", err);
            setItems(getLocalItems());
        }
    };

    useEffect(() => {
        fetchItems();
    }, [filterStyle, filterCategory, sortPrice]);

    // CRUD Operations with proper offline handling
    const handleAddItem = async (e) => {
        e.preventDefault();
        const itemToAdd = { ...newItem, userAdded: true };
        const operation = { type: 'POST', data: itemToAdd };

        const videoFile = e.target.video?.files?.[0]; // from form input

        if (isOnline && serverAvailable) {
            try {
                const res = await fetch(`${API_URL}/items`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(itemToAdd),
                    signal: AbortSignal.timeout(5000)
                });
                const data = await res.json();

                if (videoFile) {
                    const formData = new FormData();
                    formData.append("video", videoFile);
                    const videoRes = await fetch(`${API_URL}/api/products/${data.id}/video`, {
                        method: "POST",
                        body: formData
                    });
                    const videoData = await videoRes.json();
                    data.video = videoData.video;
                    data.videoUrl = videoData.videoUrl;
                }

                setItems(prev => [...prev, data]);
            } catch (err) {
                console.error("Failed to add item online, falling back to offline:", err);
                queueOperation(operation);
                setItems(prev => [...prev, { ...itemToAdd, id: `temp-${Date.now()}`, video: videoFile ? videoFile.name : null }]); }
        } else {
            queueOperation(operation);
            setItems(prev => [...prev, { ...itemToAdd, id: `temp-${Date.now()}`, video: videoFile ? videoFile.name : null }]);   }
        setNewItem({ name: "", description: "", style: "", category: "", price: 0 });
    };

    const handleEditItem = (item) => {
        setEditing(true);
        setEditItem(item);
        setNewItem(item);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        const operation = { type: 'PATCH', id: editItem.id, data: newItem };

        if (isOnline && serverAvailable) {
            try {
                const res = await fetch(`${API_URL}/items/${editItem.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newItem),
                    signal: AbortSignal.timeout(5000)
                });

                if (!res.ok) throw new Error('Failed to update item');
                const updatedItem = await res.json();
                setItems(prev => prev.map(item => item.id === editItem.id ? updatedItem : item));
            } catch (err) {
                console.error("Failed to update item online, falling back to offline:", err);
                queueOperation(operation);
                setItems(prev => prev.map(item => item.id === editItem.id ? { ...item, ...newItem } : item));
            }
        } else {
            queueOperation(operation);
            setItems(prev => prev.map(item => item.id === editItem.id ? { ...item, ...newItem } : item));
        }
        setEditing(false);
        setEditItem(null);
        setNewItem({ name: "", description: "", style: "", category: "", price: 0 });
    };

    const handleDeleteItem = async (id) => {
        const operation = { type: 'DELETE', id };

        if (isOnline && serverAvailable) {
            try {
                await fetch(`${API_URL}/items/${id}`, {
                    method: 'DELETE',
                    signal: AbortSignal.timeout(5000)
                });
                setItems(prev => prev.filter(item => item.id !== id));
            } catch (err) {
                console.error("Failed to delete item online, falling back to offline:", err);
                queueOperation(operation);
                setItems(prev => prev.filter(item => item.id !== id));
            }
        } else {
            queueOperation(operation);
            setItems(prev => prev.filter(item => item.id !== id));
        }
    };

    return (
        <div className="app">

            {!isOnline && (
                <div style={{ backgroundColor: "red", color: "white", padding: "0.5rem", textAlign: "center" }}>
                    You are currently offline. Some features m
                    ay not be available.
                </div>
            )}

            {isOnline && !serverAvailable && (
                <div style={{ backgroundColor: "orange", color: "white", padding: "0.5rem", textAlign: "center" }}>
                    Server is unavailable. Using offline mode.
                </div>
            )}

            {/* Network status banner }
{
    !isOnline || !serverAvailable ? (
        <div className="offline-banner">
            {!isOnline ? "You are offline" : "Server unavailable"} - Working locally
        </div>
    ) : (
    <div className="online-banner">Connected to server</div>
)
}

<nav>
    <button onClick={() => setCurrentPage("Home")}>Home</button>
    <button onClick={() => setCurrentPage("YourPage")}>Your Page</button>
    <button onClick={() => setCurrentPage("Charts")}>Charts</button>
</nav>

{
    currentPage === "Home" ? (
        <HomePage
            items={items}
            setItems={setItems}
            search={search}
            setSearch={setSearch}
            filterStyle={filterStyle}
            setFilterStyle={setFilterStyle}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            sortPrice={sortPrice}
            setSortPrice={setSortPrice}
            styles={styles}
            categories={categories}
            isOnline={isOnline}
            serverAvailable={serverAvailable}
            videoUrl={videoUrl}
        />
    ) : currentPage === "YourPage" ? (
        <YourPage
            items={items}
            handleAddItem={handleAddItem}
            handleSaveEdit={handleSaveEdit}
            handleDeleteItem={handleDeleteItem}
            handleEditItem={handleEditItem}
            newItem={newItem}
            setNewItem={setNewItem}
            editing={editing}
            setEditing={setEditing}
            styles={styles}
            categories={categories}
            isOnline={isOnline}
            serverAvailable={serverAvailable}
        />
    ) : (
    <Charts items={items} socket={socket} />
)
}
        </div >
    );
};

export default App; */

/*import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { syncQueue, getLocalItems, queueOperation } from '../utils/offlineQueue.js';
import HomePage from "../pages/HomePage.js";
import YourPage from "../pages/YourPage.js";
import Charts from "../pages/Charts.js";
import "../App.css";

const API_URL = "http://localhost:4000";

const App = () => {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");
    const [filterStyle, setFilterStyle] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [sortPrice, setSortPrice] = useState("");
    const [newItem, setNewItem] = useState({ name: "", description: "", style: "", category: "", price: 0 });
    const [editing, setEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState("Home");
    const [editItem, setEditItem] = useState(null);
    const [socket, setSocket] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [serverAvailable, setServerAvailable] = useState(true);
    const [videoBuffer, setVideoBuffer] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [categoryList, setCategoryList] = useState([]);


    useEffect(() => {
        const interval = setInterval(() => {
            const localItems = getLocalItems();
            if (items.length < 4 && localItems.length > 0) {
                const existingIds = new Set(items.map(item => item.id));
                const newItems = localItems.filter(item => !existingIds.has(item.id));
                if (newItems.length > 0) {
                    setItems(prev => [...prev, ...newItems]);
                }
            }
        }, 3000); // Check every 3 seconds

        return () => clearInterval(interval);
    }, [items]);



    useEffect(() => {
        if (!videoBuffer) return; // Prevent error if undefined
        const blob = new Blob([videoBuffer], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);

        // Clean up the URL object when component unmounts or buffer changes
        return () => URL.revokeObjectURL(url);
    }, [videoBuffer]);


    const styles = ["punk", "grunge", "Y2K", "hippie", "classic", "modern"];
    const categories = ["earrings", "rings", "necklace", "piercing", "bracelets", "body chain"];

    useEffect(() => {
        if (videoBuffer) {
            const blob = new Blob([videoBuffer], { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);

            return () => URL.revokeObjectURL(url); // cleanup on unmount or change
        }
    }, [videoBuffer]);

    const loadItems = async () => {
        try {
            const query = new URLSearchParams();
            if (filterStyle) query.append("style", filterStyle);
            if (filterCategory) query.append("category", filterCategory);
            if (sortPrice) query.append("sortPrice", sortPrice);

            const res = await fetch(`${API_URL}/api/products?${query.toString()}`);
            const serverItems = await res.json();

            const localItems = getLocalItems();

            // Deduplicate by ID (localItems override serverItems for same ID)
            const map = new Map();

            serverItems.forEach(item => map.set(item.id, item));
            localItems.forEach(item => map.set(item.id, item));

            setItems(Array.from(map.values()));
        } catch (error) {
            console.error("Failed to fetch items:", error);

            // fallback to local items only
            const localItems = getLocalItems();
            setItems(localItems);
        }
    };

    useEffect(() => {
        if (currentPage === "Home" && isOnline && serverAvailable) {
            loadItems();
        }
    }, [currentPage, filterStyle, filterCategory, sortPrice, isOnline, serverAvailable]);


    // Network status detection and server check
    useEffect(() => {
        const updateOnlineStatus = () => {
            const newStatus = navigator.onLine;
            setIsOnline(newStatus);
            if (newStatus) checkServerAvailability(); // Check server immediately when coming online
        };

        const checkServerAvailability = async () => {
            try {
                const res = await fetch(`${API_URL}/health`, {
                    signal: AbortSignal.timeout(3000) // Timeout after 3 seconds
                });
                setServerAvailable(res.ok);
            } catch (err) {
                setServerAvailable(false);
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        // Initial checks
        updateOnlineStatus(); // This will check both network and server status
        const interval = setInterval(checkServerAvailability, 10000);

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        const checkInternetConnection = async () => {
            try {
                // Pinging a reliable public URL (can use your server or a public site)
                const onlineCheck = await fetch("https://www.google.com/favicon.ico", {
                    method: "HEAD",
                    mode: "no-cors"
                });

                // If no error is thrown, assume online
                setIsOnline(true);
            } catch (err) {
                console.warn("No internet connection detected");
                setIsOnline(false);
            }
        };

        // Run once at start and then every 10 seconds
        checkInternetConnection();
        const interval = setInterval(checkInternetConnection, 10000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            if (!isOnline || !serverAvailable) return;

            try {
                const res = await fetch(`${API_URL}/api/categories`);
                if (!res.ok) throw new Error("Failed to fetch categories");
                const data = await res.json();
                setCategoryList(data);
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };

        fetchCategories();
    }, [isOnline, serverAvailable]);


     // WebSocket connection - only when properly online
    useEffect(() => {
        if (isOnline && serverAvailable) {
            syncQueue();
            const ws = new WebSocket(`ws://${API_URL.split('//')[1]}`);
            setSocket(ws);

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                console.log('WebSocket message received:', message);

                if (isOnline && serverAvailable) {
                    switch (message.type) {
                        case 'INITIAL_DATA':
                            setItems(prev => {
                                const existingIds = new Set(prev.map(item => item.id));
                                const newItems = message.data.filter(item => !existingIds.has(item.id));
                                return [...prev, ...newItems, ...getLocalItems()];
                            });
                            break;
                        case 'NEW_AUTO_ITEM':
                            setItems(prev => [...prev, message.data]);
                            break;
                        case 'NEW_ITEM':
                        case 'UPDATED_ITEM':
                        case 'DELETED_ITEM':
                            break;
                    }
                }
            };

            return () => ws.close();
        }
    }, [isOnline, serverAvailable]);

    useEffect(() => {
        if (currentPage === "Home" || currentPage === "YourPage") {
            const localItems = getLocalItems();
            setItems(prev => {
                const existingIds = new Set(prev.map(item => item.id));
                const merged = [...prev, ...localItems.filter(item => !existingIds.has(item.id))];
                return merged;
            });
        }
    }, [currentPage]);


    // Fetch items with offline fallback
    const fetchItems = async () => {
        try {
            const query = new URLSearchParams();
            if (filterStyle) query.append("style", filterStyle);
            if (filterCategory) query.append("category", filterCategory);
            if (sortPrice) query.append("sortPrice", sortPrice);

            const res = await fetch(`${API_URL}/api/products?${query.toString()}`);
            const serverItems = await res.json();

            setItems(prev => {
                const localItems = getLocalItems();
                const existingIds = new Set(localItems.map(item => item.id));
                // Filter out local items from serverItems to avoid duplicates
                const filteredServerItems = serverItems.filter(item => !existingIds.has(item.id));
                return [...filteredServerItems, ...localItems];
            });
        } catch (err) {
            console.error("Failed to fetch items:", err);
            const localItems = getLocalItems();
            setItems(localItems);
        }
    };



    useEffect(() => {
        if (currentPage === "Home" && isOnline && serverAvailable) {
            fetchItems();
        }
    }, [filterStyle, filterCategory, sortPrice, currentPage, isOnline, serverAvailable]);


    // CRUD Operations with proper offline handling
    const handleAddItem = async (e) => {
        e.preventDefault();

        const categoryId = parseInt(newItem.category);
        if (!categoryId || isNaN(categoryId)) {
            alert("Please select a valid category");
            return;
        }

        const itemToAdd = {
            ...newItem,
            userAdded: true,
            category_id: categoryId,
        };

        delete itemToAdd.category; // Clean up any leftover string-based field

        const operation = { type: 'POST', data: itemToAdd };
        const videoFile = e.target.video?.files?.[0];

        if (isOnline && serverAvailable) {
            try {
                const res = await fetch(`${API_URL}/api/products`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(itemToAdd),
                    signal: AbortSignal.timeout(5000)
                });

                if (!res.ok) throw new Error("Failed to add product");
                const data = await res.json();

                if (videoFile) {
                    const formData = new FormData();
                    formData.append("video", videoFile);
                    const videoRes = await fetch(`${API_URL}/api/products/${data.id}/video`, {
                        method: "POST",
                        body: formData
                    });
                    const videoData = await videoRes.json();
                    data.video = videoData.video;
                    data.videoUrl = videoData.videoUrl;
                }

                setItems(prev => [...prev, data]);
            } catch (err) {
                console.error("Failed to add item online, falling back to offline:", err);
                queueOperation(operation);
                setItems(prev => [...prev, { ...itemToAdd, id: `temp-${Date.now()}`, video: videoFile?.name || null }]);
            }
        } else {
            queueOperation(operation);
            setItems(prev => [...prev, { ...itemToAdd, id: `temp-${Date.now()}`, video: videoFile?.name || null }]);
        }

        // Reset form
        setNewItem({ name: "", description: "", style: "", category: "", price: 0 });
    };



    const handleEditItem = (item) => {
        setEditing(true);
        setEditItem(item);
        setNewItem(item);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        const operation = { type: 'PATCH', id: editItem.id, data: newItem };

        if (isOnline && serverAvailable) {
            try {
                const res = await fetch(`${API_URL}/api/products/${editItem.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer dummy-token"
                    },
                    body: JSON.stringify(newItem),
                    signal: AbortSignal.timeout(5000)
                });

                if (!res.ok) throw new Error('Failed to update item');
                const updatedItem = await res.json();
                setItems(prev => prev.map(item => item.id === editItem.id ? updatedItem : item));
            } catch (err) {
                console.error("Failed to update item online, falling back to offline:", err);
                queueOperation(operation);
                setItems(prev => prev.map(item => item.id === editItem.id ? { ...item, ...newItem } : item));
            }
        } else {
            queueOperation(operation);
            setItems(prev => prev.map(item => item.id === editItem.id ? { ...item, ...newItem } : item));
        }
        setEditing(false);
        setEditItem(null);
        setNewItem({ name: "", description: "", style: "", category: "", price: 0 });
    };

    const handleDeleteItem = async (id) => {
        const operation = { type: 'DELETE', id };

        if (isOnline && serverAvailable) {
            try {
                await fetch(`${API_URL}/api/products/${id}`, {
                    method: 'DELETE',
                    signal: AbortSignal.timeout(5000)
                });
                setItems(prev => prev.filter(item => item.id !== id));
            } catch (err) {
                console.error("Failed to delete item online, falling back to offline:", err);
                queueOperation(operation);
                setItems(prev => prev.filter(item => item.id !== id));
            }
        } else {
            queueOperation(operation);
            setItems(prev => prev.filter(item => item.id !== id));
        }
    };

    return (
        <div className="app">

            {!isOnline && (
                <div style={{ backgroundColor: "red", color: "white", padding: "0.5rem", textAlign: "center" }}>
                    You are currently offline. Some features may not be available.
                </div>
            )}

            {isOnline && !serverAvailable && (
                <div style={{ backgroundColor: "orange", color: "white", padding: "0.5rem", textAlign: "center" }}>
                    Server is unavailable. Using offline mode.
                </div>
            )}

            {/* Network status banner }
            {!isOnline || !serverAvailable ? (
                <div className="offline-banner">
                    {!isOnline ? "You are offline" : "Server unavailable"} - Working locally
                </div>
            ) : (
                <div className="online-banner">Connected to server</div>
            )}

            <nav>
                <button onClick={() => setCurrentPage("Home")}>Home</button>
                <button onClick={() => setCurrentPage("YourPage")}>Your Page</button>
                <button onClick={() => setCurrentPage("Charts")}>Charts</button>
            </nav>

            {currentPage === "Home" ? (
                <HomePage
                    items={items}
                    setItems={setItems}
                    search={search}
                    setSearch={setSearch}
                    filterStyle={filterStyle}
                    setFilterStyle={setFilterStyle}
                    filterCategory={filterCategory}
                    setFilterCategory={setFilterCategory}
                    sortPrice={sortPrice}
                    setSortPrice={setSortPrice}
                    styles={styles}
                    categories={categories}
                    isOnline={isOnline}
                    serverAvailable={serverAvailable}
                    videoUrl={videoUrl}
                />
            ) : currentPage === "YourPage" ? (
                <YourPage
                    items={items}
                    handleAddItem={handleAddItem}
                    handleSaveEdit={handleSaveEdit}
                    handleDeleteItem={handleDeleteItem}
                    handleEditItem={handleEditItem}
                    newItem={newItem}
                    setNewItem={setNewItem}
                    editing={editing}
                    setEditing={setEditing}
                    styles={styles}
                      categoryList={categoryList}
                    isOnline={isOnline}
                    serverAvailable={serverAvailable}
                />
            ) : (
                <Charts items={items} socket={socket} />
            )}
        </div>
    );
};

export default App;*/




//barely bronze
/*import React, { useEffect, useState, useCallback } from "react";
import HomePage from "../pages/HomePage.js";
import YourPage from "../pages/YourPage.js";
import Charts from "../pages/Charts.js";
import CategoryManager from "../pages/CategoryManager.js";
import "../App.css";

const API_URL = "http://localhost:4000";

const App = () => {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");
    const [filterStyle, setFilterStyle] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [sortPrice, setSortPrice] = useState("");
    const [newItem, setNewItem] = useState({ name: "", description: "", style: "", category: "", price: 0 });
    const [editing, setEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState("Home");
    const [editItem, setEditItem] = useState(null);
    const [socket, setSocket] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [categoryList, setCategoryList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const styles = ["punk", "grunge", "Y2K", "hippie", "classic", "modern"];
    const categories = ["earrings", "rings", "necklace", "piercing", "bracelets", "body chain"];

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_URL}/api/categories`);
                if (!res.ok) throw new Error("Failed to fetch categories");
                const data = await res.json();
                setCategoryList(data);
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };

        fetchCategories();
    }, []);


    const fetchItems = useCallback(async () => {
        setIsLoading(true);
        try {
            const query = new URLSearchParams();
            if (filterStyle) query.append("style", filterStyle);
            if (filterCategory) query.append("category", filterCategory);
            if (sortPrice) query.append("sortPrice", sortPrice);

            const res = await fetch(`${API_URL}/api/products?${query.toString()}`);
            const data = await res.json();
            setItems(data);
        } catch (err) {
            console.error("Failed to fetch items:", err);
        } finally {
            setIsLoading(false);
        }
    }, [filterStyle, filterCategory, sortPrice]);

    useEffect(() => {
        if (currentPage === "Home" || currentPage === "YourPage") {
            fetchItems();
        }
    }, [currentPage, fetchItems]);

    useEffect(() => {
        const ws = new WebSocket(`ws://${API_URL.split('//')[1]}`);
        setSocket(ws);

        ws.onmessage = () => {
            fetchItems(); // Refresh items on any WebSocket message
        };

        return () => ws.close();
    }, [fetchItems]);

    const handleAddItem = async (e) => {
        e.preventDefault();

        // Validate category selection
        const categoryId = parseInt(newItem.category);
        if (!categoryId || isNaN(categoryId)) {
            alert("Please select a valid category");
            return;
        }

        // Prepare the item data
        const itemToAdd = {
            name: newItem.name,
            description: newItem.description,
            style: newItem.style,
            category_id: categoryId,  // Using category_id instead of category
            price: parseFloat(newItem.price),
            userAdded: true
        };

        try {
            // 1. First create the product
            const productResponse = await fetch(`${API_URL}/api/products`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer your-auth-token-if-needed"
                },
                body: JSON.stringify(itemToAdd)
            });

            if (!productResponse.ok) {
                const errorData = await productResponse.json();
                throw new Error(errorData.message || "Failed to add product");
            }

            const productData = await productResponse.json();

            // 2. Handle video upload if present
            const videoFile = e.target.video?.files?.[0];
            if (videoFile) {
                const formData = new FormData();
                formData.append("video", videoFile);

                const videoResponse = await fetch(
                    `${API_URL}/api/products/${productData.id}/video`,
                    {
                        method: "POST",
                        body: formData
                    }
                );

                if (!videoResponse.ok) {
                    throw new Error("Video upload failed");
                }

                const videoData = await videoResponse.json();
                productData.video = videoData.video;
            }

            // 3. Update UI with the new item
            setItems(prev => [...prev, productData]);

            // 4. Reset form
            setNewItem({
                name: "",
                description: "",
                style: "",
                category: "",
                price: 0
            });
            e.target.reset();

        } catch (error) {
            console.error("Add item error:", error);
            alert(`Failed to add item: ${error.message}`);
        }
    };

    // In App.js - Add these handler functions
    const handleDeleteItem = async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 404) {
                throw new Error('Item not found');
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Delete failed');
            }

            // Update state by filtering out the deleted item
            setItems(prevItems => prevItems.filter(item => item.id !== id));

        } catch (error) {
            console.error('Delete failed:', error);

            // Revert UI if error occurs
            setItems(prev => [...prev]); // Force re-render

            alert(`Delete failed: ${error.message}`);
            throw error;
        }
    };

    const handleEditItem = (item) => {
        setEditing(true);
        setEditItem(item);
        setNewItem({
            name: item.name,
            description: item.description,
            style: item.style,
            category: item.category_id || item.category?.id,
            price: item.price
        });
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_URL}/api/products/${editItem.id}`, {
                method: 'PUT',  // or 'PATCH' depending on your API
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newItem.name,
                    description: newItem.description,
                    style: newItem.style,
                    category_id: parseInt(newItem.category),
                    price: parseFloat(newItem.price)
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update item');
            }

            const updatedItem = await response.json();

            // Update state with the edited item
            setItems(prevItems =>
                prevItems.map(item =>
                    item.id === editItem.id ? { ...updatedItem, user_added: true } : item
                )
            );

            // Reset form
            setEditing(false);
            setEditItem(null);
            setNewItem({ name: "", description: "", style: "", category: "", price: 0 });

        } catch (error) {
            console.error('Error updating item:', error);
            alert('Failed to update item. Please try again.');
        }
    };

    return (
        <div className="app">
            {isLoading && (
                <div className="loading-banner">
                    Loading...
                </div>
            )}

            <nav>
                <button onClick={() => setCurrentPage("Home")}>Home</button>
                <button onClick={() => setCurrentPage("YourPage")}>Your Page</button>
                <button onClick={() => setCurrentPage("Charts")}>Charts</button>
                <button onClick={() => setCurrentPage("Categories")}>Categories</button>
            </nav>

            {currentPage === "Categories" ? (
                <CategoryManager API_URL={API_URL} />):

            currentPage === "Home" ? (
                <HomePage
                    items={items}
                    setItems={setItems}
                    search={search}
                    setSearch={setSearch}
                    filterStyle={filterStyle}
                    setFilterStyle={setFilterStyle}
                    filterCategory={filterCategory}
                    setFilterCategory={setFilterCategory}
                    sortPrice={sortPrice}
                    setSortPrice={setSortPrice}
                    styles={styles}
                    categories={categories}
                    videoUrl={videoUrl}
                />
            ) : currentPage === "YourPage" ? (
                <YourPage
                    items={items}
                    handleAddItem={handleAddItem}
                    handleSaveEdit={handleSaveEdit}
                    handleDeleteItem={handleDeleteItem}
                    handleEditItem={handleEditItem}
                    newItem={newItem}
                    setNewItem={setNewItem}
                    editing={editing}
                    setEditing={setEditing}
                    styles={styles}
                    categoryList={categoryList}
                />
            ) : (
                <Charts items={items} socket={socket} />
            )}
        </div>
    );
};

export default App;*/

import React, { useEffect, useState, useCallback } from "react";
import HomePage from "../pages/HomePage.js";
import YourPage from "../pages/YourPage.js";
import Charts from "../pages/Charts.js";
import CategoryManager from "../pages/CategoryManager.js";
import TwoFactorLoginForm from "../pages/2factorAuth.js"; // import login page
import "../App.css";

const API_URL = "https://jewelry-website-backend-mt8c.onrender.com";

const App = () => {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");
    const [filterStyle, setFilterStyle] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [sortPrice, setSortPrice] = useState("");
    const [newItem, setNewItem] = useState({ name: "", description: "", style: "", category: "", price: 0 });
    const [editing, setEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState("Home");
    const [editItem, setEditItem] = useState(null);
    const [socket, setSocket] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [categoryList, setCategoryList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const styles = ["punk", "grunge", "Y2K", "hippie", "classic", "modern"];
    const categories = ["earrings", "rings", "necklace", "piercing", "bracelets", "body chain"];

    // Check token on mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setCurrentPage("Home");
    };

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_URL}/api/categories`);
                if (!res.ok) throw new Error("Failed to fetch categories");
                const data = await res.json();
                setCategoryList(data);
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };

        fetchCategories();
    }, []);

    const fetchItems = useCallback(async () => {
        setIsLoading(true);
        try {
            const query = new URLSearchParams();
            if (filterStyle) query.append("style", filterStyle);
            if (filterCategory) query.append("category", filterCategory);
            if (sortPrice) query.append("sortPrice", sortPrice);

            const res = await fetch(`${API_URL}/api/products?${query.toString()}`);
            const data = await res.json();
            setItems(data);
        } catch (err) {
            console.error("Failed to fetch items:", err);
        } finally {
            setIsLoading(false);
        }
    }, [filterStyle, filterCategory, sortPrice]);

    useEffect(() => {
        if (currentPage === "Home" || currentPage === "YourPage") {
            fetchItems();
        }
    }, [currentPage, fetchItems]);

    useEffect(() => {
        const ws = new WebSocket(`wss://${API_URL.split('//')[1]}`);
        setSocket(ws);

        ws.onmessage = () => {
            fetchItems();
        };

        return () => ws.close();
    }, [fetchItems]);

    const handleAddItem = async (e) => {
        e.preventDefault();
        const categoryId = parseInt(newItem.category);
        if (!categoryId || isNaN(categoryId)) {
            alert("Please select a valid category");
            return;
        }

        const itemToAdd = {
            name: newItem.name,
            description: newItem.description,
            style: newItem.style,
            category_id: categoryId,
            price: parseFloat(newItem.price),
            userAdded: true
        };

        try {
            const token = localStorage.getItem("token");

            const productResponse = await fetch(`${API_URL}/api/products`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(itemToAdd)
            });

            if (!productResponse.ok) {
                const errorData = await productResponse.json();
                throw new Error(errorData.message || "Failed to add product");
            }

            const productData = await productResponse.json();

            const videoFile = e.target.video?.files?.[0];
            if (videoFile) {
                const formData = new FormData();
                formData.append("video", videoFile);

                const videoResponse = await fetch(
                    `${API_URL}/api/products/${productData.id}/video`,
                    { method: "POST", body: formData }
                );

                if (!videoResponse.ok) throw new Error("Video upload failed");

                const videoData = await videoResponse.json();
                productData.video = videoData.video;
            }

            setItems(prev => [...prev, productData]);
            setNewItem({ name: "", description: "", style: "", category: "", price: 0 });
            e.target.reset();

        } catch (error) {
            console.error("Add item error:", error);
            alert(`Failed to add item: ${error.message}`);
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 404) throw new Error('Item not found');
            if (!response.ok) throw new Error('Delete failed');

            setItems(prevItems => prevItems.filter(item => item.id !== id));

        } catch (error) {
            console.error('Delete failed:', error);
            alert(`Delete failed: ${error.message}`);
        }
    };

    const handleEditItem = (item) => {
        setEditing(true);
        setEditItem(item);
        setNewItem({
            name: item.name,
            description: item.description,
            style: item.style,
            category: item.category_id || item.category?.id,
            price: item.price
        });
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/products/${editItem.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newItem.name,
                    description: newItem.description,
                    style: newItem.style,
                    category_id: parseInt(newItem.category),
                    price: parseFloat(newItem.price)
                })
            });

            if (!response.ok) throw new Error('Failed to update item');

            const updatedItem = await response.json();

            setItems(prevItems =>
                prevItems.map(item =>
                    item.id === editItem.id ? { ...updatedItem, user_added: true } : item
                )
            );

            setEditing(false);
            setEditItem(null);
            setNewItem({ name: "", description: "", style: "", category: "", price: 0 });

        } catch (error) {
            console.error('Error updating item:', error);
            alert('Failed to update item. Please try again.');
        }
    };

    if (!isLoggedIn) {
        return <TwoFactorLoginForm onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="app">
            {isLoading && <div className="loading-banner">Loading...</div>}

            <nav>
                <button onClick={() => setCurrentPage("Home")}>Home</button>
                <button onClick={() => setCurrentPage("YourPage")}>Your Page</button>
                <button onClick={() => setCurrentPage("Charts")}>Charts</button>
                <button onClick={() => setCurrentPage("Categories")}>Categories</button>
                <button onClick={handleLogout}>Logout</button>
            </nav>

            {currentPage === "Categories" ? (
                <CategoryManager API_URL={API_URL}
                    token={localStorage.getItem("token")} />
            ) : currentPage === "Home" ? (
                <HomePage
                    items={items}
                    setItems={setItems}
                    search={search}
                    setSearch={setSearch}
                    filterStyle={filterStyle}
                    setFilterStyle={setFilterStyle}
                    filterCategory={filterCategory}
                    setFilterCategory={setFilterCategory}
                    sortPrice={sortPrice}
                    setSortPrice={setSortPrice}
                    styles={styles}
                    categories={categories}
                    videoUrl={videoUrl}
                />
            ) : currentPage === "YourPage" ? (
                <YourPage
                    items={items}
                    handleAddItem={handleAddItem}
                    handleSaveEdit={handleSaveEdit}
                    handleDeleteItem={handleDeleteItem}
                    handleEditItem={handleEditItem}
                    newItem={newItem}
                    setNewItem={setNewItem}
                    editing={editing}
                    setEditing={setEditing}
                    styles={styles}
                    categoryList={categoryList}
                />
            ) : (
                <Charts items={items} socket={socket} />
            )}
        </div>
    );
};

export default App;
