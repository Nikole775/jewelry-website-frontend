import { render, fireEvent } from "@testing-library/react";
import YourPage from "./YourPage"; // Adjust path if necessary
import React from "react";

describe("handleAddItem", () => {
    let items, setItems, newItem, setNewItem, styles, categories, handleAddItem;

    beforeEach(() => {
        items = [
            { id: 1, name: "Gold Ring", description: "Shiny gold", style: "Elegant", category: "Ring", price: 150 }
        ];
        setItems = jest.fn();
        setNewItem = jest.fn();
        styles = ["Elegant", "Casual", "Vintage"];
        categories = ["Ring", "Necklace", "Bracelet"];
        newItem = { name: "", description: "", style: "", category: "", price: 0 };

        handleAddItem = (e) => {
            e.preventDefault();
            if (!styles.includes(newItem.style)) {
                alert("Invalid style. Please choose a valid style.");
                return;
            }
            if (!categories.includes(newItem.category)) {
                alert("Invalid category. Please choose a valid category.");
                return;
            }
            if (newItem.name && newItem.description && newItem.style && newItem.category && newItem.price) {
                const newItemWithId = {
                    ...newItem,
                    id: items.length ? Math.max(...items.map(item => item.id)) + 1 : 1,
                    userAdded: true
                };
                setItems([...items, newItemWithId]);
                setNewItem({ name: "", description: "", style: "", category: "", price: 0 });
            } else {
                alert("Please fill in all fields.");
            }
        };
    });
   

    test("rejects invalid style", () => {
        const alertMock = jest.spyOn(window, "alert").mockImplementation(() => { });
        newItem = { name: "Silver Necklace", description: "Shiny silver", style: "Modern", category: "Necklace", price: 100 };

        handleAddItem({ preventDefault: () => { } });

        expect(alertMock).toHaveBeenCalledWith("Invalid style. Please choose a valid style.");
        alertMock.mockRestore();
    });

    test("rejects invalid category", () => {
        const alertMock = jest.spyOn(window, "alert").mockImplementation(() => { });
        newItem = { name: "Silver Necklace", description: "Shiny silver", style: "Elegant", category: "Earrings", price: 100 };

        handleAddItem({ preventDefault: () => { } });

        expect(alertMock).toHaveBeenCalledWith("Invalid category. Please choose a valid category.");
        alertMock.mockRestore();
    });

    test("adds a valid item", () => {
        newItem = { name: "Silver Necklace", description: "Shiny silver", style: "Elegant", category: "Necklace", price: 100 };

        handleAddItem({ preventDefault: () => { } });

        expect(setItems).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({
                name: "Silver Necklace",
                description: "Shiny silver",
                style: "Elegant",
                category: "Necklace",
                price: 100,
                userAdded: true
            })
        ]));
        expect(setNewItem).toHaveBeenCalledWith({ name: "", description: "", style: "", category: "", price: 0 });
    });
});