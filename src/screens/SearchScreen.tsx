import React, { useState, useCallback } from 'react'
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { searchPlaces } from '@/services/geocodingService'
import type { RootStackParamList } from '@/navigation/types'
import type { SearchResult } from '@/types'

type SearchRouteProp = RouteProp<RootStackParamList, 'Search'>

export default function SearchScreen() {
  const navigation = useNavigation()
  const route = useRoute<SearchRouteProp>()
  const [query, setQuery] = useState('')

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchPlaces(query),
    enabled: query.length > 2,
    staleTime: 30_000,
  })

  const handleSelect = useCallback(
    (result: SearchResult) => {
      route.params?.onSelect?.({
        displayName: result.displayName,
        coordinates: result.coordinates,
      })
      navigation.goBack()
    },
    [navigation, route.params],
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Cari tempat atau alamat..."
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
        />
        {isFetching && <ActivityIndicator style={styles.spinner} />}
      </View>
      <FlatList
        data={results}
        keyExtractor={(item) => item.placeId}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
            <Text style={styles.resultName} numberOfLines={1}>
              {item.displayName.split(',')[0]}
            </Text>
            <Text style={styles.resultAddress} numberOfLines={1}>
              {item.displayName}
            </Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backBtn: { padding: 8, marginRight: 8 },
  backText: { fontSize: 20 },
  input: { flex: 1, fontSize: 16, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 8 },
  spinner: { marginLeft: 8 },
  resultItem: { padding: 16 },
  resultName: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  resultAddress: { fontSize: 13, color: '#666', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#f0f0f0' },
})
