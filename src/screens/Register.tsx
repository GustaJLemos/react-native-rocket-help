import { VStack } from 'native-base';
import { useState } from 'react';
import { Alert } from 'react-native';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { Input } from '../components/Input';
 
export function Register() {
  //#region Hooks
  const [isLoading, setIsLoading] = useState(false);
  const [inputPatrimony, setInputPatrimony] = useState('');
  const [inputDescription, setInputDescription] = useState('');
  const navigation = useNavigation()
  //#endregion Hooks

  function handleNewOrderRegister() {
    if(!inputPatrimony || !inputDescription) {
      return Alert.alert('Nova solicitação', 'Preencha todos os campos!')
    }

    setIsLoading(true);
    firestore()
    .collection('orders')
    .add({
      inputPatrimony, inputDescription, status: 'open', created_at: firestore.FieldValue.serverTimestamp()
    })
    .then(res => {
      Alert.alert('Nova solicitação', 'Solicitação cadastrada com sucesso.');
      navigation.goBack();
    })
    .catch(err => {
      setIsLoading(false);
      Alert.alert('Nova solicitação', 'Não foi possível cadastrar a sua solicitação, tente novamente')
    });
  }

  return (
    <VStack flex={1} p={6} bg='gray.600'>
        <Header title='Nova solicitação'/>
        <Input 
            placeholder='Número do patrimônio'
            mt={4}
            onChangeText={setInputPatrimony}
        />
        <Input 
            placeholder='Descricção do problema'
            flex={1}
            mt={5}
            multiline
            textAlignVertical='top'
            onChangeText={setInputDescription}
        />
        <Button 
            title='Cadastrar'
            mt={5}
            onPress={handleNewOrderRegister}
            isLoading={isLoading}
        />
    </VStack>
  );
}