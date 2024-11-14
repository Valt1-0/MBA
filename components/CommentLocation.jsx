import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, ScrollView } from "react-native";
import { db } from "../utils/firebase";
import {
    collection,
    getDocs,
    query,
    orderBy,
    where,
    addDoc,
    serverTimestamp,
} from "firebase/firestore";

const CommentLocation = ({ id }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        const fetchComments = async () => {
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
        };

        fetchComments();
    }, [id]);

    const handleAddComment = async () => {
        if (newComment.trim() === "") return;

        const comment = {
            locationId: id,
            text: newComment,
            createdAt: serverTimestamp(),
        };

       await addDoc(collection(db, "comments"), comment);
        setNewComment("");
        setComments([...comments, comment]);
    };

    return (
        <View style={{ padding: 20 }}> 
            <View style={{ marginVertical: 20 }}>
                <Text style={{ fontSize: 18 }}>Ajouter un commentaire</Text>
                <TextInput
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder="Votre commentaire"
                    style={{ height: 100, borderColor: 'gray', borderWidth: 1, marginVertical: 10, padding: 10 }}
                    multiline
                />
                <Button title="Ajouter" onPress={handleAddComment} />
            </View>
            <ScrollView>
                <Text style={{ fontSize: 18 }}>Commentaires</Text>
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <View key={comment.id} style={{ marginVertical: 10 }}>
                            <Text>{comment.text}</Text>
                            <Text style={{ fontSize: 12, color: 'gray' }}>
                                {comment.createdAt?.toDate ? new Date(comment.createdAt.toDate()).toLocaleString() : "En attente..."}
                            </Text>
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
