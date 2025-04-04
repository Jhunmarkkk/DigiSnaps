const renderSearchItem = ({ item }) => (
  <SearchItem
    key={item._id}
    imgSrc={item.images[0]?.url}
    name={item.name}
    price={item.price}
    onPress={() => navigate.navigate("productdetails", { id: item._id })}
  />
);

const SearchItem = ({ price, name, imgSrc, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <View
      style={{
        padding: 20,
        borderRadius: 10,
        backgroundColor: colors.color2,
        elevation: 5,
        width: "100%",
        alignItems: "center",
        justifyContent: "flex-end",
        flexDirection: "row",
        marginVertical: 30,
      }}
    >
      <Image
        source={{
          uri: imgSrc,
        }}
        style={{
          width: 80,
          height: 80,
          position: "absolute",
          resizeMode: "contain",
          top: -15,
          left: 10,
          borderTopLeftRadius: 20,
          borderBottomRightRadius: 20,
        }}
      />

      <View
        style={{
          width: "80%",
          paddingHorizontal: 30,
        }}
      >
        <Text numberOfLines={1}>{name}</Text>
        <Headline
          numberOfLines={1}
          style={{
            fontWeight: "900",
          }}
        >
          ${price}
        </Headline>
      </View>
    </View>
  </TouchableOpacity>
); 