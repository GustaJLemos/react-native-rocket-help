import { Center, FlatList, Heading, HStack, Icon, IconButton, Text, useTheme, VStack } from 'native-base';
import Logo from '../assets/logo_secondary.svg'
import { ChatTeardropText, SignOut } from 'phosphor-react-native'
import { Filter } from '../components/Filter';
import { useEffect, useState } from 'react';
import { Order } from '../components/Order';
import { OrderProps } from '../types/OrderProps';
import { Button } from '../components/Button';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import { Loading } from '../components/Loading';
import { dateFormat } from '../utils/firestoreDateFormat';

export function Home() {
  //#region Hooks
  const { colors } = useTheme()
  const [ statusSelected, setStatusSelected ] = useState<'open' | 'closed'>('open')
  const navigation  = useNavigation()
  const [isLoading, setIsloading] = useState(false);
  const [orders, setOrders] = useState<OrderProps[]>([])
  //#endregion Hooks

  //#region Functions
  function handleNewOrder() {
    navigation.navigate('new');
  }

  function handleOpenDetails(orderId: string) {
    navigation.navigate('details', { orderId: orderId })
  }

  function handleLogout(){
    auth().signOut().catch(err => {
      return Alert.alert('Sair', 'Não foi possível sair, tente novamente.');
    });
  }
  //#endregion Functions

  useEffect(() => {
    setIsloading(true);

    const subscriber = firestore()
    .collection('orders')
    .where('status', '==', statusSelected)
    .onSnapshot(snapshot => {
      const data = snapshot.docs.map(doc => {
        const { patrimony, description, status, created_at } = doc.data();
        return  {
          id: doc.id,
          patrimony, 
          description, 
          status, 
          when: dateFormat(created_at)
        }
      })
      setOrders(data);
    })
    // onSnapshot atualiza os dados em tempo real, ou seja, se eu mudar algo no bd ele reflete na aplicação em tempo real
    setIsloading(false);

    return subscriber
  }, [statusSelected]);

  if(isLoading) {
    return <Loading />
  }

  return (
    <VStack flex={1} pb={6} bg='gray.700'>
        <HStack 
            w='full'
            justifyContent='space-between'
            alignItems='center'
            bg='gray.600'
            pt={12}
            pb={5}
            px={6}
        >
            <Logo />
            <IconButton 
                icon={<SignOut size={26} color={colors.gray[300]} />}
                _pressed={{ bg: 'gray.900' }}
                onPress={handleLogout}
            />
        </HStack>

        <VStack flex={1} px={6}>
          <HStack 
            w='full' 
            mt={8} 
            mb={4} 
            justifyContent='space-between' 
            alignItems='center'> 
            <Heading color='gray.100'>
              Solicitações
            </Heading>
            <Text color='gray.200'>
              {orders.length}
            </Text>
          </HStack>
            
          <HStack space={3} mb={8}>
            <Filter 
              title='Em andamento' 
              type='open'
              onPress={() => setStatusSelected('open')} 
              isActive={statusSelected === 'open'}
            />
            <Filter 
              title='Finalizados' 
              type='closed' 
              onPress={() => setStatusSelected('closed')} 
              isActive={statusSelected === 'closed'}
            />
          </HStack>

         {isLoading 
         ? <Loading /> : 
         <FlatList 
            data={orders}
            keyExtractor={(item) => item.id} 
            renderItem={({ item }) => 
              <Order data={item} onPress={() => handleOpenDetails(item.id)}/>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 60}}
            ListEmptyComponent={() => (
              <Center>
                <ChatTeardropText color={colors.gray[300]} size={40}/>
                <Text color='gray.300' fontSize='xl' mt={6} textAlign='center'>
                  Você ainda não possui  {'\n'} solicitações
                  {statusSelected === 'open' ? 'em andamento' : 'finalizadas'}
                </Text>
              </Center>
            )}
          />}
          <Button title='Nova solicitação' onPress={handleNewOrder}/>
        </VStack>
    </VStack>
  );
}