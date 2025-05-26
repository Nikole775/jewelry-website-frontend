import React, { useState, useEffect } from "react";

const CategoryManager = ({ API_URL, token }) => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/api/categories`);
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        try {
            const response = await fetch(`${API_URL}/api/categories`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: newCategory })
            });

            if (!response.ok) {
                throw new Error("Failed to add category");
            }

            const addedCategory = await response.json();
            setCategories([...categories, addedCategory]);
            setNewCategory("");
        } catch (error) {
            console.error("Error adding category:", error);
            alert("Could not add category.");
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            console.log("Token being sent:", token); // Check if token exists

            const response = await fetch(`${API_URL}/api/categories/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"// <--- add token here
                }
            });

            if (!response.ok) {
                const errorData = await response.json(); // Get server error details
                console.error("Server error:", errorData);
                throw new Error("Failed to delete category");
            }

            setCategories(categories.filter(cat => cat.id !== id));
        } catch (error) {
            console.error("Error deleting category:", error);
            alert("Could not delete category.");
        }
    };

    return (
        <div className="panel" style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
            <h2>Manage Categories</h2>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {categories.map(cat => (
                            <li key={cat.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                <span>{cat.name}</span>
                                <button
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    style={{
                                        backgroundColor: "#f44336",
                                        color: "white",
                                        border: "none",
                                        padding: "5px 10px",
                                        borderRadius: "4px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>

                    <form onSubmit={handleAddCategory} style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                        <input
                            type="text"
                            placeholder="New category name"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            style={{ flex: 1, padding: "8px" }}
                        />
                        <button
                            type="submit"
                            style={{
                                backgroundColor: "#4CAF50",
                                color: "white",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            Add
                        </button>
                    </form>
                </>
            )}
        </div>
    );
};

export default CategoryManager;
