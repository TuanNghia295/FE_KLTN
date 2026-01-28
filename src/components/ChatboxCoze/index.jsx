import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { SiNike } from "react-icons/si";
import { IoSendSharp } from "react-icons/io5";
import { FaComment, FaTimes } from 'react-icons/fa';
import { MdCleaningServices } from "react-icons/md";
import '../ChatboxCoze/style.css'
import useStore from '../../store/useStore';
import { Link } from 'react-router-dom';
import { useAddToCart } from '../../services/cartServices';
import { IoBagAddSharp } from "react-icons/io5";
import { MdFullscreen } from "react-icons/md";
import { formatCash } from '../../hook/formatCash'
import axiosClient from '../../apis/axiosClient';

// function parseStructuredProductMarkdown(markdown) {
//     const productBlocks = markdown.split(/\n\d+\.\s+\*\*/); // tách các block bắt đầu bằng số thứ tự
//     const results = [];

//     for (let i = 1; i < productBlocks.length; i++) { // bỏ phần đầu nếu rỗng
//         const block = "**" + productBlocks[i]; // thêm lại ** bị tách ra
//         const result = {};

//         const titleMatch = block.match(/\*\*(.+?)\*\*/);
//         if (titleMatch) result.name = titleMatch[1].trim();

//         const priceMatch = block.match(/- \*\*Giá\*\*:\s*(.+)/);
//         if (priceMatch) result.price = priceMatch[1].trim();

//         const descMatch = block.match(/- \*\*Mô tả\*\*:\s*(.+)/);
//         if (descMatch) result.description = descMatch[1].trim();

//         const imageMatch = block.match(/!\[.*?\]\((.*?)\)/);
//         if (imageMatch) result.image = imageMatch[1].trim();

//         const linkMatch = block.match(/\[Xem chi tiết\]\((.*?)\)/);
//         if (linkMatch) result.link = linkMatch[1].trim();

//         if (Object.keys(result).length > 0) results.push(result);
//     }

//     return results;
// }

//Ver 1
// const extractJSON = (fullAnswer) => {
//     // Bước 1: Ưu tiên tìm giữa ```json ... ```
//     let match = fullAnswer.match(/```json\s+([\s\S]*?)```/);
//     if (match && match[1]) {
//         try {
//             return JSON.parse(match[1]);
//         } catch (err) {
//             console.error('Lỗi parse JSON trong ```json:```', err);
//         }
//     }

//     // Bước 2: Nếu không có, tìm đoạn JSON đầu tiên bằng regex đơn giản hơn
//     match = fullAnswer.match(/\{[\s\S]*?\}/); // tìm đoạn {...}
//     if (match) {
//         try {
//             return JSON.parse(match[0]);
//         } catch (err) {
//             console.error('Lỗi parse JSON dạng thô:', err);
//         }
//     }

//     return null;
// };

//Ver 2
const extractJSON = (fullAnswer) => {
    // Bước 1: Ưu tiên tìm đoạn giữa ```json ... ```
    let match = fullAnswer.match(/```json\s+([\s\S]*?)```/);
    if (match && match[1]) {
        try {
            const cleaned = match[1].trim();
            return JSON.parse(cleaned);
        } catch (err) {
            console.error('Lỗi parse JSON trong ```json:```', err);
        }
    }

    // Bước 2: Nếu không có, tìm đoạn JSON thô (có thể là object hoặc array)
    match = fullAnswer.match(/(\{[\s\S]*?\}|\[[\s\S]*?\])/);
    if (match) {
        try {
            return JSON.parse(match[0]);
        } catch (err) {
            console.error('Lỗi parse JSON dạng thô:', err);
        }
    }

    return null;
};


// Component chính
function ChatBoxCoze() {
    const user_id = useStore((state) => state.userInfo?._id); // Lấy ra user id từ fetchUserInfo ở Zustand
    const { mutate: handleAddToCart } = useAddToCart();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messageRef = useRef(null);
    const [selectedSizes, setSelectedSizes] = useState({});
    const [cart, setCart] = useState(null);
    const [fullscreen, setFullScreen] = useState(false);

    useEffect(() => {
        if (messages.length === 0) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'bot',
                    type: 'answer',
                    content: 'Tôi là trợ lý Nike. Bạn cần tôi trợ giúp gì có thể hỏi tại đây!'
                }
            ]);
        }
    }, [messages]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messageRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Hiệu ứng gõ chữ dần + xử lý follow_up sau khi gõ xong
    const typeAnswerThenFollowUp = (text, followUps, index = 0, delay = 20) => {
        if (index < text.length) {
            setMessages((prev) => {
                const updated = [...prev];
                const last = updated.pop();
                if (last && last.type === 'answer') {
                    updated.push({ ...last, content: last.content + text[index] });
                } else {
                    updated.push(last);
                    updated.push({ role: 'bot', type: 'answer', content: text[index] });
                }
                return updated;
            });
            scrollToBottom();
            setTimeout(() => typeAnswerThenFollowUp(text, followUps, index + 1, delay), delay);
        } else {
            // Khi gõ xong, thêm follow_up vào
            if (followUps.length > 0) {
                setMessages((prev) => [...prev, ...followUps]);
                scrollToBottom();
            }
        }
    };

    const sendMessage = async (text) => {
        const messageToSend = text || input;
        if (!messageToSend.trim()) return;

        const userMessage = { role: 'user', content: messageToSend };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true)
        setMessages((prev) => [...prev, { role: 'bot', type: 'loading', content: 'Đang phân tích...' }]);

        const finalUserId = user_id ? user_id : `guest_${Math.random().toString(36).substring(2, 12)}`;

        try {
            const response = await axiosClient.post('/chat/chatWithCoze', {
                user_id: finalUserId,
                additional_messages: [
                    userMessage
                ],
            });

            console.log(response)

            const data = response; // Quan trọng: phải đúng key là `messages`

            // Gom các đoạn `answer` lại và gom `follow_up` riêng
            let fullAnswer = '';
            const followUps = [];

            for (const m of data) {
                const { type, content } = m.data;

                if (type === 'answer') {
                    fullAnswer += content;
                }

                if (type === 'follow_up') {
                    followUps.push({ role: 'bot', type: 'follow_up', content });
                }
            }

            // Tách sản phẩm từ fullAnswer và hiển thị
            const productData = extractJSON(fullAnswer);
            console.log('fullAnswer', fullAnswer)
            console.log('products', productData)

            if (productData) {
                const productList = Array.isArray(productData) ? productData : [productData];
                setMessages((prev) => [...prev, { role: 'bot', type: 'products', content: productList }]);
            } else {
                typeAnswerThenFollowUp(fullAnswer, followUps);
            }
        } catch (error) {
            console.error('Error fetching response:', error);
        }

        setLoading(false)
        setMessages((prev) => prev.filter((msg) => msg.type !== 'loading'));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') sendMessage();
    };

    //Add To Cart
    // const handleChooseSize = (e, productId, variations) => {
    //     const size = e.target.value;
    //     const userId = user_id;

    //     // Lưu lại size đã chọn cho sản phẩm này
    //     setSelectedSizes(prev => ({ ...prev, [productId]: size }));

    //     // Tìm color đầu tiên ứng với size
    //     const variation = variations.find(v => v.size === size);
    //     if (!variation) return;

    //     const color = variation.color;

    //     // Xoá sản phẩm cũ cùng productId trong giỏ (nếu có)
    //     const updatedCart = cart.filter(item => item.productId !== productId);

    //     // Thêm sản phẩm mới vào giỏ
    //     setCart([
    //         ...updatedCart,
    //         { userId, productId, size, color, quantity: 1 }
    //     ]);
    // };
    const handleChooseSize = (e, productId, variations, product) => {
        const size = e.target.value;
        const userId = user_id;

        setSelectedSizes(prev => ({ ...prev, [productId]: size }));

        const variation = variations.find(v => v.size === size);
        if (!variation) return;

        const color = variation.color;

        // Set cart thành 1 object duy nhất
        setCart({
            userId,
            productId,
            product_variant_id: variation.id,
            size,
            color,
            quantity: 1,
            product
        });
    };

    return (
        <>

            <button className="chat-toggle-button" onClick={toggleChat}>
                {!isOpen ? <FaComment className="chat-icon" /> : <FaTimes className="chat-icon" />}
            </button>


            {isOpen && (
                <div className={`chat-container flex flex-col ${fullscreen ? '!w-screen !h-screen !bottom-0 !left-0 !rounded-none' : ''}`}>
                    <div className='flex bg-white text-black p-4 shadow-sm border-b border-[#ccc] items-center rounded-t-xl'>
                        <div className='part1 flex gap-3 items-center'>
                            <SiNike className='text-[50px] text-white bg-[#000] p-1 rounded-full' />
                            <div className='info-chat'>
                                <p className='font-bold'>Nike Agent AI</p>
                                <p className='font-thin'>Active now</p>
                            </div>
                        </div>
                        <div className='ml-auto gap-3 flex'>
                            <button onClick={() => { setFullScreen(!fullscreen) }}><MdFullscreen /></button>
                            <button onClick={() => { setMessages([]) }}><MdCleaningServices /></button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 p-4 bg-white">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`my-2 px-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl  
                ${msg.role === 'user'
                                            ? 'bg-black text-white rounded-br-none'
                                            : msg.type === 'follow_up'
                                                ? 'bg-white border border-[#f1f1f1] text-gray-800 rounded-bl-none'
                                                : 'bg-gray-100 text-gray-900 rounded-bl-none'
                                        }`}
                                >
                                    {msg.type === 'products' ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            {msg.content.map((product, i) => (
                                                <div key={i} className="border rounded-xl p-4 shadow bg-white">
                                                    <img
                                                        src={product.images}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                    <h3 className="font-semibold mt-2 text-lg">{product.name}</h3>
                                                    <p className="text-red-500 font-semibold mt-1">{formatCash(product.price)}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {product.description.split(' ').slice(0, 10).join(' ')}
                                                        {product.description.split(' ').length > 20 && '...'}
                                                        {product._id && (
                                                            <Link
                                                                to={`/products/${product._id}`}
                                                                className="inline-block text-blue-600 underline text-sm"
                                                            >
                                                                Xem chi tiết
                                                            </Link>
                                                        )}
                                                    </p>
                                                    <div className='addToCart flex gap-4 items-center bg-[#f1f1f1] p-2 my-2 rounded-md'>
                                                        <select
                                                            className='bg-[#f1f1f1] p-1 rounded-md'
                                                            value={selectedSizes[product.productId] || ''}
                                                            onChange={(e) => handleChooseSize(e, product.productId, product.variations, {
                                                                _id: product._id?.toString() || product.productId?.toString(),
                                                                productId: product.productId,
                                                                name: product.name,
                                                                price: parseFloat(product.price),
                                                                images: product.images ? [{ url: product.images, isPrimary: true }] : [],
                                                                variations: product.variations || [],
                                                            })}
                                                        >
                                                            <option value="">Choose Size</option>
                                                            {[...new Set(product.variations.map(v => v.size))].map(size => (
                                                                <option key={size} value={size}>{size}</option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            className='ml-auto'
                                                            onClick={() => {
                                                                handleAddToCart(cart);
                                                            }}
                                                        ><IoBagAddSharp className='text-[20px]' /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : msg.type === 'follow_up' ? (
                                        <button
                                            onClick={() => sendMessage(msg.content)}
                                        >
                                            {msg.content}
                                        </button>
                                    ) : msg.type === 'loading' ? (
                                        <span className="italic text-gray-400">{msg.content}</span>
                                    ) : (
                                        <span className="whitespace-pre-wrap">{msg.content}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messageRef} />
                    </div>
                    <div className="flex gap-2 p-4 bg-white border-t border-[#ccc] rounded-b-xl">
                        <input
                            type="text"
                            className="flex-1 border p-2 rounded-sm"
                            value={input}
                            disabled={loading}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Nhập tin nhắn..."
                        />
                        <button
                            className="text-white"
                            onClick={() => sendMessage()}
                            disabled={loading}
                        >
                            <IoSendSharp className='text-[40px] !text-black hover:bg-black hover:!text-white rounded-full p-2 duration-500' />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default ChatBoxCoze;
