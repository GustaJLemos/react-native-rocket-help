import { useNavigation, useRoute } from '@react-navigation/native';
import { Box, HStack, ScrollView, Text, useTheme, VStack } from 'native-base';
import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { OrderProps } from '../types/OrderProps';
import firestore from '@react-native-firebase/firestore'
import { OrderFirestoreDTO } from '../DTOs/OrderFirestoreDTO';
import { dateFormat } from '../utils/firestoreDateFormat';
import { Loading } from '../components/Loading';
import { CircleWavyCheck, Clipboard, DesktopTower, Hourglass } from 'phosphor-react-native';
import { CardDetails } from '../components/CardDetails';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Alert } from 'react-native';

type RouteParams = {
  orderId: string;
}

type OrderDetails = OrderProps & {
  description: string;
  solution: string;
  closed: string;
}

export function Details() {
  const route = useRoute()
  const { orderId } = route.params as RouteParams;

  const { colors } = useTheme();
  const [isLoading, setIsloading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [solution, setSolution] = useState('');
  const [order, setOrder] = useState<OrderDetails>({} as OrderDetails);
  const navigation = useNavigation();

  const colorByStatus = order.status === 'closed' ? colors.green[300] : colors.secondary[700];

  useEffect(() => {
    firestore()
    .collection<OrderFirestoreDTO>('orders')
    .doc(orderId)
    .get()
    .then(doc => {
      const { patrimony, description, status, created_at, closed_at, solution } = doc.data()

      const closed = closed_at ? dateFormat(closed_at) : null;

      setOrder({
        id: doc.id,
        patrimony,
        description,
        status,
        solution,
        when: dateFormat(created_at),
        closed
      })

      setIsloading(false);
    });
  }, []);

  function handleOrderClose() {
    if(!solution) {
      return Alert.alert('Solicitação', 'Informe a solução para encerrar a solicitação')
    }
    setButtonLoading(true);

    firestore()
    .collection<OrderFirestoreDTO>('orders')
    .doc(orderId)
    .update({
      status: 'closed',
      solution,
      closed_at: firestore.FieldValue.serverTimestamp(),
    })
    .then(res => {
      Alert.alert('Solicitação', 'Solicitação encerrada.');
      navigation.goBack();
    })
    .catch(err => {
      setButtonLoading(false);
      Alert.alert('Solicitação', 'Não foi possível encerrar a solicitação.');
    });
  }

  if(isLoading){
    return <Loading />;
  }

  return (
    <VStack flex={1} bg='gray.700'>
      <Box px={6} bg='gray.600'>
        <Header title='Solicitação'/>
      </Box>
        
        <HStack bg='gray.500' justifyContent='center' p={4}>
          {
            order.status === 'closed'
            ? <CircleWavyCheck size={22} color={colors.green[300]}  />
            : <Hourglass size={22} color={colors.secondary[700]} />
          }

          <Text
            fontSize='sm'
            color={colorByStatus}
            ml={2}
            textTransform='uppercase'
          >
            {order.status === 'closed' ? 'finalizado' : 'em andamento'}
          </Text>

          <ScrollView mx={5} showsVerticalScrollIndicator={false}>
            <CardDetails 
              title='Equipamento'
              description={`Patrimônio ${order.patrimony}`}
              icon={DesktopTower}
              footer={order.when}
            />

            <CardDetails 
              title='Descrição do problema'
              description={order.description}
              icon={Clipboard}
            />

            <CardDetails 
              title='Solução'
              description={order.solution}
              icon={CircleWavyCheck}
              footer={order.closed && `Encerrado em: ${order.closed}`}
            >
              {
                order.status === 'open' &&
                  <Input
                    placeholder='Descrição da solução'
                    onChangeText={setSolution}
                    h={24}
                    textAlignVertical='top'
                    multiline                
                  />
              }
            </CardDetails>
          </ScrollView>
          
          {
            order.status === 'open' && 
            <Button 
              title='Encerrar solicitação'
              m={5}
              onPress={handleOrderClose}
              isLoading={buttonLoading}
            />
          }
        </HStack>
    </VStack>
  );
}