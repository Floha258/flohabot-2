/**
 * Non-platform specific utilities. Primarily used in shared modules
 */
class GlobalUtils {
    /**
     * Gets today's date in DD/MM/YYYY format
     * @returns String representation of today's date in YYYY-MM-DD format
     */
    static getTodaysDate() {
        const ts = Date.now();
        const date = new Date(ts);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
}

module.exports.GlobalUtils = GlobalUtils;