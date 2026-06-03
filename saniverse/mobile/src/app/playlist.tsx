import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'
import { Anime } from '@/service/animeStore'
import { commonStyles } from '@/styles/commonStyles'
import PlaylistHeader from '@/components/playlist/PlaylistHeader'
import VideoPlayer from '@/components/playlist/VideoPlayer'
import Interactions from '@/components/playlist/Interactions'

const Page = () => {
    const item = useLocalSearchParams() as any as Anime
    return (
        <View style={commonStyles.containerBlack}>
            <PlaylistHeader title={item.title} genre={item.genre} />
            <VideoPlayer item={item} />
            <Interactions item={item} />
        </View>
    )
}

export default Page