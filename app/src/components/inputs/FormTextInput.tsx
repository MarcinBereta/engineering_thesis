import {Controller} from 'react-hook-form';
import {StyleSheet, Text, TextInput} from 'react-native';

interface FormTextInputProps extends React.ComponentProps<typeof TextInput> {
  control: any;
  name: string;
}

const styles = StyleSheet.create({
  errorMessage: {
    color: 'red',
    fontSize: 12,
  },
});

export const FormTextInput = ({
  control,
  name,
  ...props
}: FormTextInputProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
        <>
          <TextInput
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            {...props}
          />
          {error && <Text style={styles.errorMessage}>{error.message}</Text>}
        </>
      )}
      rules={{required: true}}
    />
  );
};
