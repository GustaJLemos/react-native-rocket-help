import { Heading, VStack, Icon, useTheme } from "native-base";
import Logo from '../assets/logo_primary.svg'
import { Envelope, Key } from 'phosphor-react-native'
import { Button } from "../components/Button";
import { useState } from "react";
import { Input } from "../components/Input";
import auth from '@react-native-firebase/auth';
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

export function SignIn() {
    //#region Hooks
    const [inputEmail, setInputEmail] = useState('')
    const [inputPassword, setInputPassword] = useState('')
    const [isLoading, setIsloading] = useState(false)
    const { colors } = useTheme()
    const navigation = useNavigation()
    //#endregion Hooks
    function showErrorAlertByErrorCode(errorCode) {
        if(errorCode === 'auth/invalid-email') {
            return Alert.alert('Não foi possível acessar!', 'E-mail inválido.')
        }

        if(errorCode === 'auth/wrong-password') {
            return Alert.alert('Não foi possível acessar!', 'E-mail ou senha inválidos.')
        }

        if(errorCode === 'auth/user-not-found') {
            return Alert.alert('Não foi possível acessar!', 'E-mail ou senha inválidos')
        }

        return Alert.alert('Não foi possível acessar!', 'Tente novamente.')
    };

    function handleSignIn() {
        if(!inputEmail || !inputPassword) {
            return Alert.alert('Entrar', 'Informe e-mail e senha.')
        }

        setIsloading(true)
        auth()
        .signInWithEmailAndPassword(inputEmail, inputPassword)
        .catch(err => {
            setIsloading(false);
            showErrorAlertByErrorCode(err.code)
        });
    }

    return (
        <VStack flex={1} alignItems='center' bg='gray.600' px={8} pt={24}>
            <Logo />
            <Heading color='gray.100' fontSize='xl' mt={20} mb={6}>
                Acesse sua conta
            </Heading>
            <Input 
                placeholder="E-mail" 
                mb={4}
                InputLeftElement={<Icon as={<Envelope color={colors.gray[300]}/>} ml={4}/>}
                onChangeText={setInputEmail}
                autoCapitalize='none'
            />
            <Input 
                mb={8}
                placeholder="Senha"
                secureTextEntry
                InputLeftElement={<Icon as={<Key color={colors.gray[300]}/>} ml={4}/>}
                onChangeText={setInputPassword}
            />
            <Button 
                title="Entrar"
                w='full' 
                onPress={handleSignIn} 
                isLoading={isLoading}    
            />
        </VStack>
    )
}