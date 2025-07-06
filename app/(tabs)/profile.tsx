import React from 'react';
import { View, Text, Button } from 'react-native';

import { router } from 'expo-router';

const ContactsPage: React.FC = () => {
    return (
        <View>
            <Text>Profile</Text>
            <Text>This is the contacts page.</Text>
            <Button title="Go to Home" onPress={() => router.push('/')} />
        </View>
    );
};

export default ContactsPage;
