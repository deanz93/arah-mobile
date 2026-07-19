import React from 'react'
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native'

interface Props {
  onPress: () => void
  placeholder?: string
  value?: string
}

export default function SearchBar({ onPress, placeholder = 'Cari destinasi...' }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.icon}>🔍</Text>
      <Text style={styles.placeholder}>{placeholder}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    gap: 10,
  },
  icon: { fontSize: 16 },
  placeholder: { flex: 1, fontSize: 15, color: '#888' },
})
