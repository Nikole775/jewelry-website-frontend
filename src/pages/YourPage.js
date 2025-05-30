/*import React, { useState } from "react";
import { getLocalItems } from '../utils/offlineQueue.js';

const YourPage = ({
    items,
    handleAddItem,
    handleSaveEdit,
    handleEditItem,
    handleDeleteItem,
    newItem,
    setNewItem,
    editing,
    setEditing,
    styles,
    categoryList,
    isOnline,
    serverAvailable
}) => {
    const [videoFile, setVideoFile] = useState(null);

    const userAddedItems = items.filter(item => item.userAdded);
    const prices = userAddedItems.map(item => item.price);
    const maxPrice = Math.max(...prices, 0);
    const minPrice = Math.min(...prices, Infinity);
    const avgPrice = prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;

    const getBackgroundColor = (price) => {
        if (prices.length === 0) return 'white';
        if (price === maxPrice) return '#EFC3CA';
        if (price === minPrice) return '#C1F8FA';
        if (Math.abs(price - avgPrice) < 1) return '#B7B7B7';
        return 'white';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        if (videoFile) {
            formData.append('video', videoFile);
        }

        if (editing) {
            await handleSaveEdit(e);
        } else {
            await handleAddItem(e);
        }

        setVideoFile(null);
        e.target.reset();
    };

    const handleCancel = () => {
        setEditing(false);
        setNewItem({ name: "", description: "", style: "", category: "", price: 0 });
        setVideoFile(null);
    };

    const uploadVideo = async (itemId, file) => {
        const formData = new FormData();
        formData.append("video", file);
        try {
            await fetch(`/upload/${itemId}`, {
                method: "POST",
                body: formData,
            });
        } catch (err) {
            console.error("Video upload failed:", err);
        }
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
        <div className="panel" style={{ padding: "20px" }}>
            <h2>Your Items ({userAddedItems.length})</h2>

            <div className="jewelry-list" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "20px",
                marginBottom: "40px"
            }}>
                {userAddedItems.map(item => (
                    <div
                        key={item.id}
                        className="jewelry-card"
                        style={{
                            backgroundColor: getBackgroundColor(item.price),
                            padding: "15px",
                            borderRadius: "8px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            position: "relative"
                        }}
                    >
                        <h3 style={{ marginTop: 0 }}>{item.name}</h3>
                        <p>{item.description}</p>
                        <p><strong>Style:</strong> {item.style}</p>
                        <p><strong>Category:</strong> {item.category}</p>
                        <p><strong>Price:</strong> ${item.price.toFixed(2)}</p>

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

                        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                            <button
                                onClick={() => handleEditItem(item)}
                                style={{
                                    padding: "5px 10px",
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer"
                                }}
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDeleteItem(item.id)}
                                style={{
                                    padding: "5px 10px",
                                    backgroundColor: "#f44336",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer"
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="panel" style={{
                backgroundColor: "#f9f9f9",
                padding: "20px",
                borderRadius: "8px",
                maxWidth: "500px",
                margin: "0 auto"
            }}>
                <h2 style={{ marginTop: 0 }}>{editing ? "Edit Item" : "Add New Item"}</h2>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>

                    <div>
                        <label>Upload Video (optional):</label>
                        <input
                            type="file"
                            name="video"
                            accept="video/*"
                            onChange={(e) => setVideoFile(e.target.files[0])}
                        />
                    </div>

                    <div>
                        <label>Name:</label>
                        <input
                            type="text"
                            placeholder="Item name"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            required
                            style={{ width: "100%", padding: "8px" }}
                        />
                    </div>

                    <div>
                        <label>Description:</label>
                        <textarea
                            placeholder="Item description"
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            required
                            style={{ width: "100%", padding: "8px", minHeight: "80px" }}
                        />
                    </div>

                    <div>
                        <label>Style:</label>
                        <select
                            value={newItem.style}
                            onChange={(e) => setNewItem({ ...newItem, style: e.target.value })}
                            required
                            style={{ width: "100%", padding: "8px" }}
                        >
                            <option value="">Select Style</option>
                            {styles.map(style => (
                                <option key={style} value={style}>{style}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Category:</label>
                        <select
                            value={newItem.category}
                            onChange={(e) =>
                                setNewItem({ ...newItem, category: e.target.value })
                            }
                        >
                            <option value="">Select category</option>
                            {categoryList.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>


                    </div>

                    <div>
                        <label>Price ($):</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={newItem.price}
                            onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                            required
                            min="0"
                            step="0.01"
                            style={{ width: "100%", padding: "8px" }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                        <button
                            type="submit"
                            style={{
                                padding: "10px 15px",
                                backgroundColor: "#4CAF50",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                flex: 1
                            }}
                        >
                            {editing ? "Save Changes" : "Add Item"}
                        </button>
                        {editing && (
                            <button
                                type="button"
                                onClick={handleCancel}
                                style={{
                                    padding: "10px 15px",
                                    backgroundColor: "#f44336",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    flex: 1
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default YourPage;*/




//brnze fix hopefully

import React, { useState } from "react";

const YourPage = ({
    items,
    handleAddItem,
    handleSaveEdit,
    handleEditItem,
    handleDeleteItem,
    newItem,
    setNewItem,
    editing,
    setEditing,
    styles,
    categoryList = []
}) => {
    const [videoFile, setVideoFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userAddedItems = items.filter(item => item.user_added || item.userAdded === true);
    const prices = userAddedItems.map(item => item.price);
    const maxPrice = Math.max(...prices, 0);
    const minPrice = Math.min(...prices, Infinity);
    const avgPrice = prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;

    const getBackgroundColor = (price) => {
        if (prices.length === 0) return 'white';
        if (price === maxPrice) return '#EFC3CA';
        if (price === minPrice) return '#C1F8FA';
        if (Math.abs(price - avgPrice) < 1) return '#B7B7B7';
        return 'white';
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editing) {
                await handleSaveEdit(e);
            } else {
                await handleAddItem(e);
            }

            // Reset form only if successful
            setNewItem({ name: "", description: "", style: "", category: "", price: 0 });
            setVideoFile(null);
            e.target.reset();
        } catch (error) {
            console.error("Form submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setEditing(false);
        setNewItem({ name: "", description: "", style: "", category: "", price: 0 });
        setVideoFile(null);
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
        <div className="panel" style={{ padding: "20px" }}>
            <h2>Your Items ({userAddedItems.length})</h2>

            {userAddedItems.length === 0 ? (
                <p>No items added yet. Add your first item below.</p>
            ) : (
                <div className="jewelry-list" style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "20px",
                    marginBottom: "40px"
                }}>
                    {userAddedItems.map(item => (
                        <div
                            key={item.id}
                            className="jewelry-card"
                            style={{
                                backgroundColor: getBackgroundColor(item.price),
                                padding: "15px",
                                borderRadius: "8px",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                position: "relative"
                            }}
                        >
                            <h3 style={{ marginTop: 0 }}>{item.name}</h3>
                            <p>{item.description}</p>
                            <p><strong>Style:</strong> {item.style}</p>
                            <p><strong>Category:</strong> {item.category}</p>
                            <p><strong>Price:</strong> ${item.price.toFixed(2)}</p>

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

                            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                                <button
                                    onClick={() => handleEditItem(item)}
                                    style={{
                                        padding: "5px 10px",
                                        backgroundColor: "#4CAF50",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    style={{
                                        padding: "5px 10px",
                                        backgroundColor: "#f44336",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="panel" style={{
                backgroundColor: "#f9f9f9",
                padding: "20px",
                borderRadius: "8px",
                maxWidth: "500px",
                margin: "0 auto"
            }}>
                <h2 style={{ marginTop: 0 }}>{editing ? "Edit Item" : "Add New Item"}</h2>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>

                    <div>
                        <label>Upload Video (optional):</label>
                        <input
                            type="file"
                            name="video"
                            accept="video/*"
                            onChange={(e) => setVideoFile(e.target.files[0])}
                        />
                    </div>

                    <div>
                        <label>Name:</label>
                        <input
                            type="text"
                            placeholder="Item name"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            required
                            style={{ width: "100%", padding: "8px" }}
                        />
                    </div>

                    <div>
                        <label>Description:</label>
                        <textarea
                            placeholder="Item description"
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            required
                            style={{ width: "100%", padding: "8px", minHeight: "80px" }}
                        />
                    </div>

                    <div>
                        <label>Style:</label>
                        <select
                            value={newItem.style}
                            onChange={(e) => setNewItem({ ...newItem, style: e.target.value })}
                            required
                            style={{ width: "100%", padding: "8px" }}
                        >
                            <option value="">Select Style</option>
                            {styles.map(style => (
                                <option key={style} value={style}>{style}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Category:</label>
                        <select
                            value={newItem.category}
                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                            required
                            style={{ width: "100%", padding: "8px" }}
                        >
                            <option value="">Select category</option>
                            {categoryList.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Price ($):</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={newItem.price}
                            onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                            required
                            min="0"
                            step="0.01"
                            style={{ width: "100%", padding: "8px" }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                padding: "10px 15px",
                                backgroundColor: isSubmitting ? "#cccccc" : "#4CAF50",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: isSubmitting ? "not-allowed" : "pointer",
                                flex: 1
                            }}
                        >
                            {isSubmitting ? "Processing..." : (editing ? "Save Changes" : "Add Item")}
                        </button>
                        {editing && (
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                                style={{
                                    padding: "10px 15px",
                                    backgroundColor: "#f44336",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    flex: 1
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default YourPage;




/*import React, { useState } from "react";
import { getLocalItems } from '../utils/offlineQueue.js';

const YourPage = ({
    items,
    handleAddItem,
    handleSaveEdit,
    handleEditItem,
    handleDeleteItem,
    newItem,
    setNewItem,
    editing,
    setEditing,
    styles,
    categories,
    isOnline,
    serverAvailable
}) => {

    const [videoFile, setVideoFile] = useState(null);
    const userAddedItems = items.filter(item => item.userAdded);
    const prices = userAddedItems.map(item => item.price);
    const maxPrice = Math.max(...prices, 0);
    const minPrice = Math.min(...prices, Infinity);
    const avgPrice = prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;

    const getBackgroundColor = (price) => {
        if (prices.length === 0) return 'white';
        if (price === maxPrice) return '#EFC3CA';
        if (price === minPrice) return '#C1F8FA';
        if (Math.abs(price - avgPrice) < 1) return '#B7B7B7';
        return 'white';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        /*const item = editing ? await handleSaveEdit(e) : await handleAddItem(e);
        if (videoFile && item?.id) {
            await uploadVideo(item.id, videoFile);
            setVideoFile(null);
        }
const formData = new FormData(e.target);
if (videoFile) {
    formData.append('video', videoFile);
}

if (editing) {
    await handleSaveEdit(e);
} else {
    await handleAddItem(e);
}

setVideoFile(null);
e.target.reset();
    };

const handleCancel = () => {
    setEditing(false);
    setNewItem({ name: "", description: "", style: "", category: "", price: 0 });
    setVideoFile(null);
};

const uploadVideo = async (itemId, file) => {
    const formData = new FormData();
    formData.append("video", file);
    try {
        await fetch(`/upload/${itemId}`, {
            method: "POST",
            body: formData,
        });
    } catch (err) {
        console.error("Video upload failed:", err);
    }
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
    <div className="panel" style={{ padding: "20px" }}>
        <h2>Your Items ({userAddedItems.length})</h2>

        <div className="jewelry-list" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
            marginBottom: "40px"
        }}>
            {userAddedItems.map(item => (
                <div
                    key={item.id}
                    className="jewelry-card"
                    style={{
                        backgroundColor: getBackgroundColor(item.price),
                        padding: "15px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        position: "relative"
                    }}
                >
                    <h3 style={{ marginTop: 0 }}>{item.name}</h3>
                    <p>{item.description}</p>
                    <p><strong>Style:</strong> {item.style}</p>
                    <p><strong>Category:</strong> {item.category}</p>
                    <p><strong>Price:</strong> ${item.price.toFixed(2)}</p>

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

                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                        <button
                            onClick={() => handleEditItem(item)}
                            style={{
                                padding: "5px 10px",
                                backgroundColor: "#4CAF50",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDeleteItem(item.id)}
                            style={{
                                padding: "5px 10px",
                                backgroundColor: "#f44336",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>

        <div className="panel" style={{
            backgroundColor: "#f9f9f9",
            padding: "20px",
            borderRadius: "8px",
            maxWidth: "500px",
            margin: "0 auto"
        }}>
            <h2 style={{ marginTop: 0 }}>{editing ? "Edit Item" : "Add New Item"}</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>

                <div>
                    <label>Upload Video (optional):</label>
                    <input
                        type="file"
                        name="video"
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files[0])}
                    />
                </div>

                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        placeholder="Item name"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        required
                        style={{ width: "100%", padding: "8px" }}
                    />
                </div>

                <div>
                    <label>Description:</label>
                    <textarea
                        placeholder="Item description"
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        required
                        style={{ width: "100%", padding: "8px", minHeight: "80px" }}
                    />
                </div>

                <div>
                    <label>Style:</label>
                    <select
                        value={newItem.style}
                        onChange={(e) => setNewItem({ ...newItem, style: e.target.value })}
                        required
                        style={{ width: "100%", padding: "8px" }}
                    >
                        <option value="">Select Style</option>
                        {styles.map(style => (
                            <option key={style} value={style}>{style}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Category:</label>
                    <select
                        value={newItem.category}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        required
                        style={{ width: "100%", padding: "8px" }}
                    >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Price ($):</label>
                    <input
                        type="number"
                        placeholder="0.00"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                        required
                        min="0"
                        step="0.01"
                        style={{ width: "100%", padding: "8px" }}
                    />
                </div>

                <div>
                    <label>Upload Video:</label>
                    <input
                        type="file"
                        name="video"
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files[0])}
                    />
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button
                        type="submit"
                        style={{
                            padding: "10px 15px",
                            backgroundColor: "#4CAF50",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            flex: 1
                        }}
                    >
                        {editing ? "Save Changes" : "Add Item"}
                    </button>
                    {editing && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            style={{
                                padding: "10px 15px",
                                backgroundColor: "#f44336",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                flex: 1
                            }}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    </div>
);
};

export default YourPage
*/


