# Custom Hooks for JiuJitsu Finder

This directory contains reusable custom hooks that standardize state management patterns across the app.

## Available Hooks

### `useGymActions`
Centralizes gym-related actions like opening websites, directions, copying, sharing, and favoriting.

```typescript
import { useGymActions } from '../hooks';

const MyComponent = () => {
  const { favorites, toggleFavorite } = useApp();
  const shareCardRef = useRef(null);
  
  const {
    copyingGymId,
    copiedGymId,
    sharingGymId,
    handleOpenWebsite,
    handleOpenDirections,
    handleCopyGymWithState,
    handleShareGym,
    handleToggleFavorite,
  } = useGymActions({
    favorites,
    toggleFavorite,
    shareCardRef,
  });

  // Use in your component
  return (
    <TouchableOpacity onPress={() => handleOpenWebsite(gym.website)}>
      <Text>Visit Website</Text>
    </TouchableOpacity>
  );
};
```

### `useGymSearch`
Manages search state, debounced search, recent searches, and search suggestions.

```typescript
import { useGymSearch } from '../hooks';

const MyComponent = () => {
  const [allGyms, setAllGyms] = useState<OpenMat[]>([]);
  
  const {
    isSearching,
    searchQuery,
    searchResults,
    searchSuggestions,
    recentSearches,
    showSuggestions,
    handleInputChange,
    handleSelectSuggestion,
    handleClearRecent,
    closeSearch,
    startSearch,
  } = useGymSearch({
    allGyms,
    onSearchResultsChange: (results) => {
      // Handle search results change
    },
  });

  return (
    <TextInput
      value={searchQuery}
      onChangeText={handleInputChange}
      onFocus={startSearch}
    />
  );
};
```

### `useGymModal`
Manages modal visibility, selected gym state, and modal actions.

```typescript
import { useGymModal } from '../hooks';

const MyComponent = () => {
  const {
    modalVisible,
    selectedGym,
    shareCardGym,
    shareCardSession,
    shareCardRef,
    showGymDetails,
    handleCloseModal,
    setShareCardData,
  } = useGymModal({
    onModalOpen: (gym) => {
      // Handle modal open
    },
    onModalClose: () => {
      // Handle modal close
    },
  });

  return (
    <Modal visible={modalVisible} onRequestClose={handleCloseModal}>
      {/* Modal content */}
    </Modal>
  );
};
```

### `useGymFilters`
Manages filter state, filter application, and filter counts.

```typescript
import { useGymFilters } from '../hooks';

const MyComponent = () => {
  const [allGyms, setAllGyms] = useState<OpenMat[]>([]);
  
  const {
    activeFilters,
    sessionCounts,
    filteredGyms,
    hasActiveFilters,
    toggleFilter,
    handleFreeFilter,
    resetFilters,
    getFilterSummary,
  } = useGymFilters({
    allGyms,
    onFiltersChange: (filteredGyms) => {
      // Handle filtered gyms change
    },
  });

  return (
    <TouchableOpacity onPress={() => toggleFilter('gi')}>
      <Text>Gi ({sessionCounts.giCount})</Text>
    </TouchableOpacity>
  );
};
```

## Combined Usage Example

Here's how to use multiple hooks together in a screen component:

```typescript
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useGymActions, useGymSearch, useGymModal, useGymFilters } from '../hooks';

const ResultsScreen = () => {
  const { favorites, toggleFavorite } = useApp();
  const [allGyms, setAllGyms] = useState<OpenMat[]>([]);

  // Initialize all hooks
  const gymActions = useGymActions({
    favorites,
    toggleFavorite,
    shareCardRef: gymModal.shareCardRef,
  });

  const gymSearch = useGymSearch({
    allGyms,
    onSearchResultsChange: (results) => {
      // Update filtered gyms based on search
    },
  });

  const gymModal = useGymModal({
    onModalOpen: (gym) => {
      gymActions.setShareCardData(gym);
    },
  });

  const gymFilters = useGymFilters({
    allGyms: gymSearch.searchResults.length > 0 ? gymSearch.searchResults : allGyms,
  });

  return (
    <View>
      {/* Search Section */}
      <SearchInput
        value={gymSearch.searchQuery}
        onChangeText={gymSearch.handleInputChange}
        onFocus={gymSearch.startSearch}
      />

      {/* Filter Section */}
      <FilterBar
        activeFilters={gymFilters.activeFilters}
        sessionCounts={gymFilters.sessionCounts}
        onToggleFilter={gymFilters.toggleFilter}
      />

      {/* Gym List */}
      <GymList
        gyms={gymFilters.filteredGyms}
        onGymPress={gymModal.showGymDetails}
        onHeartPress={gymActions.handleToggleFavorite}
        onCopyPress={gymActions.handleCopyGymWithState}
        copyingGymId={gymActions.copyingGymId}
        copiedGymId={gymActions.copiedGymId}
      />

      {/* Modal */}
      <GymModal
        visible={gymModal.modalVisible}
        gym={gymModal.selectedGym}
        onClose={gymModal.handleCloseModal}
        onShare={gymActions.handleShareGym}
        favorites={favorites}
        copiedGymId={gymActions.copiedGymId}
      />
    </View>
  );
};
```

## Benefits

1. **Consistency**: All screens use the same patterns for gym interactions
2. **Reusability**: Hooks can be used across different screens
3. **Maintainability**: State logic is centralized and easier to update
4. **Type Safety**: All hooks are properly typed with TypeScript
5. **Performance**: Hooks use `useCallback` and `useMemo` for optimization
6. **Testing**: Hooks can be tested independently of UI components

## Migration Guide

To migrate existing screens to use these hooks:

1. **Replace duplicate state**: Remove local state that's now managed by hooks
2. **Update imports**: Import hooks from `../hooks`
3. **Replace handlers**: Use hook-provided handlers instead of local ones
4. **Update props**: Pass hook state and handlers to child components
5. **Test functionality**: Ensure all existing functionality still works

## Best Practices

1. **Single Responsibility**: Each hook manages one specific concern
2. **Composition**: Combine multiple hooks for complex screens
3. **Callbacks**: Use optional callbacks for parent notification
4. **Cleanup**: Hooks handle their own cleanup automatically
5. **Error Handling**: Hooks include proper error handling and logging 