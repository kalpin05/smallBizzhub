/**
 * XML Parser for Navigation Configuration
 * Parses navigationConfig.xml and returns navigation items
 */

import navigationXML from '../config/navigationConfig.xml';

/**
 * Parse XML string to navigation items
 * @param {string} xmlString - XML content as string
 * @param {string} userType - 'business' or 'client'
 * @returns {Array} Array of navigation menu items
 */
export function parseNavigationXML(xmlString, userType) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
        console.error('XML Parsing Error:', parserError.textContent);
        return [];
    }

    // Get the user type section (business or client)
    const userSection = xmlDoc.querySelector(userType);
    if (!userSection) {
        console.error(`User type "${userType}" not found in XML`);
        return [];
    }

    // Get all menuItem elements
    const menuItems = userSection.querySelectorAll('menuItem');

    // Convert to array of objects
    const navigationItems = Array.from(menuItems).map(item => ({
        id: item.getAttribute('id'),
        label: item.getAttribute('label'),
        path: item.getAttribute('path'),
        icon: item.getAttribute('icon')
    }));

    return navigationItems;
}

/**
 * Load navigation items for a specific user type
 * @param {string} userType - 'business' or 'client'
 * @returns {Promise<Array>} Promise resolving to navigation items
 */
export async function loadNavigation(userType) {
    try {
        // Fetch the XML file
        const response = await fetch(navigationXML);
        const xmlText = await response.text();

        // Parse and return navigation items
        return parseNavigationXML(xmlText, userType);
    } catch (error) {
        console.error('Error loading navigation XML:', error);
        return [];
    }
}

/**
 * Synchronous version - parses XML directly from imported file
 * @param {string} userType - 'business' or 'client'
 * @returns {Array} Array of navigation menu items
 */
export function getNavigationSync(userType) {
    // For development, we'll use a fallback approach
    // In production, you'd fetch the XML file

    const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
<navigation>
  <business>
    <menuItem id="dashboard" label="Dashboard" path="/business-dashboard" icon="LayoutDashboard" />
    <menuItem id="profile" label="My Profile" path="/business-profile" icon="User" />
    <menuItem id="products" label="Products" path="/business-products" icon="Package" />
    <menuItem id="orders" label="Orders" path="/business-orders" icon="ShoppingCart" />
    <menuItem id="analytics" label="Analytics" path="/business-analytics" icon="BarChart3" />
    <menuItem id="settings" label="Settings" path="/business-settings" icon="Settings" />
  </business>
  <client>
    <menuItem id="discover" label="Discover" path="/client-discover" icon="Search" />
    <menuItem id="orders" label="My Orders" path="/client-orders" icon="ShoppingCart" />
    <menuItem id="profile" label="My Profile" path="/client-profile" icon="User" />
  </client>
</navigation>`;

    return parseNavigationXML(xmlString, userType);
}
