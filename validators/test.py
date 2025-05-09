# Tabla de letras: A=0, B=1, ..., Z=25, espacio=26
char_map = {chr(i + 65): i for i in range(26)}
char_map[' '] = 26
reverse_map = {v: k for k, v in char_map.items()}

# Parámetros RSA
N = 33       # N = p * q = 3 * 11
e = 7        # exponente público
d = 3        # exponente privado (porque 7 * 3 ≡ 1 mod 20)

def rsa_encrypt_char(m, e, N):
    return pow(m, e, N)

def rsa_decrypt_char(c, d, N):
    return pow(c, d, N)

def encode_message(msg):
    msg = msg.upper()
    numeric = [char_map.get(c, 26) for c in msg]  # map unknowns to space
    encrypted = [rsa_encrypt_char(m, e, N) for m in numeric]
    return encrypted

def decode_message(cipher):
    decrypted = [rsa_decrypt_char(c, d, N) for c in cipher]
    text = ''.join([reverse_map.get(m, '?') for m in decrypted])
    return text

# === Ejemplo de uso ===

mensaje = "PORFA PONME UN DIEZ"
print("Mensaje original:", mensaje)

cifrado = encode_message(mensaje)
print("Mensaje cifrado:", cifrado)

descifrado = decode_message([0, 11, 1, 20, 7, 9, 2, 30, 0])
print("Mensaje descifrado:", descifrado)
