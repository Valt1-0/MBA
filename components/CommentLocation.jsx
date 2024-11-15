import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { db, storage } from "../utils/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { UserContext } from "../context/UserContext";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome6 } from "@expo/vector-icons";

const CommentLocation = ({ id }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const { userInfo, isAuthenticated } = useContext(UserContext);
  const router = useRouter();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const imageRef = ref(storage, `comments/${Date.now()}`);
    await uploadBytes(imageRef, blob);
    return await getDownloadURL(imageRef);
  };
  const handleAddComment = async () => {
    if (newComment.trim() === "") return;

    try {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const commentRef = await addDoc(collection(db, "comments"), {
        locationId: id,
        text: newComment,
        createdAt: serverTimestamp(),
        createdBy: {
          uid: userInfo?.uid,
          displayName: userInfo?.displayName || "Anonyme",
          photoURL: userInfo?.photoURL,
        },
        imageUrl: imageUrl,
      });

      const newCommentWithId = {
        id: commentRef.id,
        locationId: id,
        text: newComment,
        createdAt: new Date(),
        createdBy: {
          uid: userInfo?.uid,
          displayName: userInfo?.displayName || "Anonyme",
          photoURL: userInfo?.photoURL,
        },
        imageUrl: imageUrl,
      };

      setNewComment("");
      setSelectedImage(null);
      setComments([newCommentWithId, ...comments]);
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsRef = query(
          collection(db, "comments"),
          where("locationId", "==", id),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(commentsRef);
        const commentsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(commentsList);
      } catch (error) {
        console.error("Error fetching comments: ", error);
      }
    };

    fetchComments();
  }, [id]);

  return (
    <View style={{ padding: 20 }}>
      <View style={{ marginVertical: 20 }}>
        <Text style={{ fontSize: 18 }}>Ajouter un commentaire</Text>
        {isAuthenticated ? (
          <>
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Votre commentaire"
              style={{
                height: 100,
                borderColor: "gray",
                borderWidth: 1,
                marginVertical: 10,
                padding: 10,
              }}
              multiline
            />
            {selectedImage && (
              <View style={{ marginVertical: 10 }}>
                <Image
                  source={{ uri: selectedImage }}
                  style={{ width: 200, height: 150, borderRadius: 10 }}
                />
                <TouchableOpacity
                  onPress={() => setSelectedImage(null)}
                  style={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    backgroundColor: "red",
                    borderRadius: 15,
                    width: 30,
                    height: 30,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FontAwesome6 name="times" size={15} color="white" />
                </TouchableOpacity>
              </View>
            )}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginVertical: 10,
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#DDC97A",
                  padding: 10,
                  borderRadius: 5,
                  flexDirection: "row",
                  alignItems: "center",
                }}
                onPress={pickImage}
              >
                <FontAwesome6
                  name="image"
                  size={20}
                  color="white"
                  style={{ marginRight: 5 }}
                />
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Ajouter une image
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: "#4ACC4A",
                  padding: 10,
                  borderRadius: 5,
                  flexDirection: "row",
                  alignItems: "center",
                }}
                onPress={handleAddComment}
              >
                <FontAwesome6
                  name="paper-plane"
                  size={20}
                  color="white"
                  style={{ marginRight: 5 }}
                />
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Envoyer
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity
            style={{
              backgroundColor: "#DDC97A",
              padding: 10,
              borderRadius: 5,
              alignItems: "center",
              marginTop: 10,
            }}
            onPress={() => router.push("/auth")}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Se Connecter
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>Commentaires</Text>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <View
              key={comment.id || `temp-${Date.now()}`}
              style={{
                marginVertical: 10,
                padding: 10,
                backgroundColor: "#f5f5f5",
                borderRadius: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Image
                  source={
                    comment.createdBy?.photoURL
                      ? { uri: comment.createdBy.photoURL }
                      : require("../assets/avatar-placeholder.png")
                  }
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    marginRight: 10,
                  }}
                />
                <View>
                  <Text style={{ fontWeight: "bold" }}>
                    {comment.createdBy?.displayName || "Anonyme"}
                  </Text>
                  <Text style={{ fontSize: 12, color: "gray" }}>
                    {comment.createdAt?.toDate
                      ? new Date(comment.createdAt.toDate()).toLocaleString()
                      : new Date().toLocaleString()}
                  </Text>
                </View>
              </View>
              <Text style={{ marginBottom: 5 }}>{comment.text}</Text>
              {comment.imageUrl && (
                <Image
                  source={{ uri: comment.imageUrl }}
                  style={{
                    width: "100%",
                    height: 200,
                    borderRadius: 10,
                    marginVertical: 5,
                  }}
                  resizeMode="cover"
                />
              )}
            </View>
          ))
        ) : (
          <Text>Aucun commentaire pour cette localisation.</Text>
        )}
      </ScrollView>
    </View>
  );
};

export default CommentLocation;
