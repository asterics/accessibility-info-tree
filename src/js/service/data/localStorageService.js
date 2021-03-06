let localStorageService = {};
let KEY_USERNAME = 'AIT_KEY_ENTRY_USERNAME';
let KEY_DB_USER = 'AIT_KEY_DB_USER';
let KEY_PASSWORD = 'AIT_KEY_PASSWORD';
let KEY_FILTEROPTIONS = 'AIT_KEY_FILTEROPTIONS';
let KEY_LAST_SEARCH_RESULTS = 'AIT_KEY_LAST_SEARCH_RESULTS';
let storage = null;
let _tempStorage = {};

if (typeof (Storage) !== "undefined") {
    try {
        storage = window.localStorage;
    } catch (e) {
        log.error('could not access local storage, maybe disabled by user? Error: ' + e)
    }

}

localStorageService.save = function (key, value) {
    if (storage) {
        try {
            return storage.setItem(key, value);
        } catch (e) {
            log.error(e)
        }
    }
};

localStorageService.get = function (key) {
    if (storage) {
        try {
            return storage.getItem(key);
        } catch (e) {
            log.error(e)
        }
    }
};

localStorageService.remove = function (key) {
    if (storage) {
        try {
            return storage.removeItem(key);
        } catch (e) {
            log.error(e)
        }
    }
};

/**
 * saves the name of the user who created the last entry
 * @param username
 * @return {void | undefined}
 */
localStorageService.saveUser = function (username) {
    return localStorageService.save(KEY_USERNAME, username);
};

/**
 * gets the name of the user who created the last entry
 * @return {string | undefined}
 */
localStorageService.getUser = function () {
    return localStorageService.get(KEY_USERNAME) || "";
};

localStorageService.saveDbUser = function (user) {
    return localStorageService.save(KEY_DB_USER, user);
};

localStorageService.getDbUser = function () {
    return localStorageService.get(KEY_DB_USER);
};

localStorageService.savePassword = function (password) {
    return localStorageService.save(KEY_PASSWORD, password);
};

localStorageService.getPassword = function () {
    return localStorageService.get(KEY_PASSWORD);
};

localStorageService.saveFilterOptions = function (options) {
    return _tempStorage[KEY_FILTEROPTIONS] = JSON.stringify(options);
};

localStorageService.getFilterOptions = function () {
    return JSON.parse(_tempStorage[KEY_FILTEROPTIONS] || null);
};

localStorageService.saveSearchResults = function (results) {
    return _tempStorage[KEY_LAST_SEARCH_RESULTS] = JSON.stringify(results);
};

localStorageService.getSearchResults = function () {
    return JSON.parse(_tempStorage[KEY_LAST_SEARCH_RESULTS] || null);
};

export {localStorageService};