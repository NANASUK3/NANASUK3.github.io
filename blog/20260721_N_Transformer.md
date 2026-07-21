# From Text to Transformer: A Complete Pipeline from BPE to Language Modeling

## 0. Introduction
本篇博客受CS336启发，将从最常见的自然语言文本出发，讲解语言模型（Language Model）处理自然语言的完整流程。在每一章节的开头，我们将以核心问题为导向，逐步讲解 Transformer 架构的实现细节。

目前，以 GPT 系列为代表的自回归语言模型主要采用“Next Token Prediction”的范式，即基于已观测的上下文序列 $x_{1:t}=(x_1, x_2, ..., x_t)$ 预测下一个 Token $x_{t+1}$ 的分布。

在数学形式上，这一过程被定义为条件概率分布 $p_\theta(x_{t+1} \mid x_{1:t})$，其中 $\theta$ 表示模型的可学习参数。根据概率论中的链式法则，目标序列 $x_{1:T}$ 的联合概率分布可分解为各个时间步条件概率的乘积：
$$
p_\theta(x_{1:T}) = \prod_{t=1}^{T} p_\theta(x_t \mid x_{<t})
$$
在训练阶段，模型的优化目标即为最大化训练语料库的对数似然函数（Log-Likelihood），这等价于最小化预测分布与真实经验分布之间的交叉熵损失（Cross-Entropy Loss），其目标函数可表示为：
$$
\mathcal{L}(\theta) = -\sum_{t=1}^{T} \log p_\theta(x_t \mid x_{<t})
$$
## 1. Text is not machine-readable
对人类而言，自然语言文本具备直观的可读性。例如，人类可以流畅地阅读并理解本文标题“From Text to Transformer: A Complete Pipeline from BPE to Language Modeling”。然而，计算机的底层硬件仅能执行数值运算，无法直接理解字符语义。为解决此问题，业界引入了 UTF-8、UTF-16、GBK 等字符编码标准，实现了字符与数值之间的一一映射。以本文标题为例，采用 UTF-8 编码可将本文标题编码为一串十六进制数值（如 `46 72 6f 6d 20 54 65 ...`），计算机则可借助此在数值层面上表示文本。

在深度学习领域，模型同样采用类似的处理方法，即将朴素的文本转化为计算机可处理的数值形式，进而输入神经网络进行学习。因此，语言模型的输入不是朴素的文本，而是经过处理的高维向量（Token）。
## 2. Tokenization: Byte Pair Encoding (BPE)
如何定义和划分 Token 是构建语言模型的关键。理想的 Tokenization 方法需要在词汇表大小（Vocabulary Size）与序列长度之间取得一定的平衡，使每个 Token 能够捕获适当的语义信息。

Byte-Pair Encoding (BPE) 是一种经典且广泛使用的 Subword Tokenization 算法。
假设给定如下训练语料：`"low low low low low lower lower widest widest widest newest newest newest newest newest newest"`，BPE 算法的具体流程如下：

### 2.1 Vocabulary Initialization
BPE 首先需要对词表进行初始化。对于 BPE 算法而言，基础词表通常初始化为 256 个原始字节（Bytes，对应 0~255 的 Unicode 码位），随后加入特定的 Special Tokens（如 `<|endoftext|>`）以处理序列边界等特殊情况。

```python
def vocab_init(self):
    """Initialize the vocabulary with 256 bytes and special tokens."""
    # Base byte vocabulary (IDs 0~255)
    for token_id in range(256):
        self.vocab[token_id] = bytes([token_id])
    
    # Special tokens
    for token in self.special_tokens:
        token_id = len(self.vocab)
        self.vocab[token_id] = token.encode("utf-8")
```
### 2.2 Pre-Tokenization
如果直接在原始字符流上进行 BPE 合并，可能会导致跨越单词边界的无意义合并（例如将前一个词的尾字母与后一个词的首字母强行合并），并且标点符号的存在也可能会产生问题。为解决此问题，在实际算法流程中，一般需要对原始语料库进行预分词（Pre-Tokenization），将其分割为粗粒度的单词（Words）或符号序列。这一步通常借助正则表达式实现，以 GPT-2 为例，其预分词正则规则如下：
```python
PAT = r"""'(?:[sdmt]|ll|ve|re)| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+"""
```
经过预分词处理后，原始语料被分割为独立的单词，进而统计各单词的出现频率。对于上述示例文本，预分词及词频统计结果为：`{'low': 5, 'lower': 2, 'widest': 3, 'newest': 6}`。在底层实现中，这一过程通常使用 `Dict[Tuple[bytes, ...], int]` 的数据结构来存储单词的字节序列及其对应的频率。
### 2.3 Pair-Merge
在完成预分词后，算法将遍历语料库中的所有单词，将每个单词相邻的字符两两配对，并统计全局的相邻符号对的频率。

以单词 `"lower"` 为例，其被拆分为 `(l, o), (o, w), (w, e), (e, r)`。结合词频统计，上述示例文本的全局符号对频率最终汇总为：
`{'lo': 7, 'ow': 7, 'we': 8, 'er': 2, 'wi': 3, 'id': 3, 'de': 3, 'es': 9, 'st': 9, 'ne': 6, 'ew': 6}`。

接下来，算法会选择统计频率最高的符号对进行合并（例如将 `"e"` 和 `"s"` 合并为 `"es"`）。若出现频率相同的符号对，通常按字典序来决定合并顺序。该过程将不断迭代，直到词表达到预设的目标大小。

每次合并所产生的子词（Subword）都会被加入词表中，并记录下相应的合并规则（Merge Rules，如 `('e', 's') -> 'es'`）。最终，算法将构建出一个包含丰富子词的词汇表，并建立离散整数 ID 与 Token 之间的映射关系，最终得到词表示例如下：

> [!NOTE]
>
> {0: b'\x00', 1: b'\x01', 2: b'\x02', 3: b'\x03', 4: b'\x04', 5: b'\x05', 6: b'\x06', 7: b'\x07', 8: b'\x08', 9: b'\t', 10: b'\n', 11: b'\x0b', 12: b'\x0c', 13: b'\r', 14: b'\x0e', 15: b'\x0f', 16: b'\x10', 17: b'\x11', 18: b'\x12', 19: b'\x13', 20: b'\x14', ..., 254: b'\xfe', 255: b'\xff', 256: b'<|endoftext|>', 257: b' t', 258: b'he', 259: b' a', 260: b' s',..., 538: b' bridge', 539: b' proud', 540: b' tall'
> }
## 3. Embedding: discrete → continuous space
经过 BPE 算法处理后，原始文本序列已被转化为离散的子词（Subword）整数索引序列（即 Token IDs，例如 "tall" 被映射为 540）。然而，离散的整数标识符无法直接参与神经网络中的矩阵运算，也无法进行反向传播优化模型。因此，我们需要将这些离散的 Token IDs 映射到高维的连续向量空间中，这一过程被称为词嵌入（Token Embedding）。

在 Transformer 架构中，Embedding 层本质上是一个巨大的查找表（Lookup Table）。其 PyTorch 实现如下所示：

```python
class Embedding(nn.Module):
    def __init__(self,num_embeddings:int,embedding_dim:int,device:torch.device=None,
                 dtype:torch.dtype=None):
        super().__init__()
        # num_embeddings: int Size of the vocabulary 
        # embedding_dim: int Dimension of the embedding vectors, i.e., d_model
        # device: torch.device | None = None Device to store the parameters on 
        # dtype: torch.dtype | None = None Data type of the parameters
        self.num_embeddings = num_embeddings
        self.embeddings_dim = embedding_dim
        
        self.weight = nn.Parameter(
            torch.empty(self.num_embeddings, self.embeddings_dim),
            requires_grad=True,
            device=device,
            dtype=dtype,
        )
        torch.nn.init.trunc_normal_(self.weight, mean=0, std=1, a=-3, b=3)

    def forward(self, token_ids: torch.Tensor) -> torch.Tensor:
        # output.shape = (batch_size, seq_len, d_model)
        return self.weight[token_ids]
```
在进行词嵌入后，每个离散的 Token IDs 会对应一个高维向量，在之后的训练中主要由该高维向量进行训练。

### 4. Positional Encoding

在获取文本的词嵌入（Word Embedding）表示后，模型需要进一步处理高维词向量。Transformer 架构的核心在于自注意力机制（Self-Attention），该机制通过计算全局上下文权重来捕获序列信息。然而，自注意力机制无法感知 token 之间的顺序与位置信息。而序列的位置信息对于语义理解至关重要，因此必须为 tokens 注入位置编码。

位置编码通常分为绝对位置编码（Absolute Positional Encoding）与相对位置编码（Relative Positional Encoding）。相较于绝对位置，相对位置信息在捕捉局部语法结构和长距离语义依赖方面往往更具优势。在《Attention Is All You Need》中，Transformer 采用了基于正弦和余弦函数的加性绝对位置编码。然而，随着大语言模型对长文本处理需求的增加，加性编码在长度外推性（Length Extrapolation）上暴露出局限性。当前，业界在长文本序列处理中广泛采用旋转位置编码（Rotary Position Embedding, RoPE）来实现更为高效的位置信息注入。

#### 4.1 RoPE
RoPE 的核心思想是通过正交旋转矩阵对词向量进行乘法变换，在保持向量模长不变的前提下，将绝对位置信息转化为相对位置信息。

假设在二维空间中，存在两个向量 $x$ 和 $y$，分别对其施加角度为 $\theta_1$ 和 $\theta_2$ 的旋转操作：
$$
x' = R(\theta_1)x, \quad y' = R(\theta_2)y
$$
其中 $R(\theta)$ 为二维旋转矩阵。计算旋转后的向量内积：

$$
\begin{aligned}
(x')^T y' &= (R(\theta_1)x)^T R(\theta_2)y \\
&= x^T R(\theta_1)^T R(\theta_2)y
\end{aligned}
$$

由于旋转矩阵是正交矩阵，满足 $R(\theta)^T = R(-\theta)$，且旋转矩阵的乘法满足角度叠加性质，即 $R(-\theta_1)R(\theta_2) = R(\theta_2 - \theta_1)$。因此，上述内积可化简为：

$$
(x')^T y' = x^T R(\theta_2 - \theta_1)y
$$

**该推导表明，旋转后向量的内积仅依赖于两个旋转角度的差值 $(\theta_2 - \theta_1)$。**

在 Self-Attention 机制中，若将第 $i$ 个 token 的旋转角度设定为 $\theta_i = i\omega$（$\omega$ 为频率参数），则 Query 向量 $q_i$ 和 Key 向量 $k_j$ 的旋转形式为：
$$
q_i' = R(i\omega)q_i, \quad k_j' = R(j\omega)k_j
$$

此时，注意力分数变为：
$$
(q_i')^T k_j' = q_i^T R((j-i)\omega)k_j
$$

由此可见，原本依赖于绝对位置 $i$ 和 $j$ 的内积运算，被转化为仅依赖于相对位置 $(j-i)$ 的运算。需要强调的是，必须同时对 Query 和 Key 施加旋转操作，若仅对其中之一进行旋转，则无法在最终的内积结果中消去绝对位置项。

#### 4.2 高维空间的推广与子空间分解

上述推导基于二维空间。在实际的 Transformer 架构中，词向量的维度 $d$ 通常较高（如 $d=64$ 或 $128$）。在高维空间中，无法像二维空间那样通过单一的旋转角 $\theta$ 来描述整个向量的旋转。

为解决这一问题，RoPE 采用子空间分解（Subspace Decomposition）策略，即将 $d$ 维空间正交分解为 $d/2$ 个相互独立的二维子空间。具体而言，RoPE 将 $d$ 维向量 $x = (x_1, x_2, \ldots, x_d)$ 拆分为 $d/2$ 个二维向量对：
$$
(x_1, x_2), (x_3, x_4), \ldots, (x_{d-1}, x_d)
$$
在每个二维子空间内独立执行上述旋转操作。在矩阵表达上，高维旋转矩阵 $R(\Theta)$ 被构造为一个分块对角矩阵：
$$
R(\Theta) =
\begin{bmatrix}
R(\theta_1) & 0 & \cdots & 0 \\
0 & R(\theta_2) & \cdots & 0 \\
\vdots & \vdots & \ddots & \vdots \\
0 & 0 & \cdots & R(\theta_{d/2})
\end{bmatrix}
$$

其中，每个 $R(\theta_m)$ 是一个 $2 \times 2$ 的二维旋转矩阵。

#### 4.3 多尺度频率分配的动机

在上述分块对角矩阵中，不同二维子空间所使用的旋转频率 $\theta_m$ 是不同的。通过多频率设计，RoPE 能够在不增加额外参数的前提下，同时兼顾局部与全局的相对位置信息，显著提升了模型对长文本序列的建模能力。

#### 4.4 RoPE 的 PyTorch 实现

以下是 RoPE 的标准 PyTorch 实现。代码中采用了相邻维度拆分（Even/Odd split）的技巧，以实现二维子空间的旋转操作，避免了显式构造庞大的分块对角矩阵。

```python
class RoPE(nn.Module):
    def __init__(self, theta: float, d_k: int, max_seq_len: int, device=None):
        super().__init__()
        self.theta = theta  # 基准角度
        self.d_k = d_k  # features
        self.max_seq_len = max_seq_len
        self.device = device

        # 1. 计算多尺度逆频率 (Inverse Frequencies)
        # 公式: \theta_m = theta^{-2m/d_k}，其中 m = 0, 1, ..., d_k/2 - 1
        inv_freq = 1.0 / (theta ** (torch.arange(0, d_k, 2).float() / d_k))
        
        # 2. 计算绝对位置序列
        positions = torch.arange(max_seq_len).float()

        # 3. 计算外积得到每个位置、每个频率的旋转角度 (Outer Product)
        # shape: (max_seq_len, d_k / 2)
        freqs = torch.outer(positions, inv_freq)

        # 4. 预计算并缓存 cos 和 sin 表，避免在前向传播时重复计算
        self.register_buffer("cos_tables", freqs.cos(), persistent=False)
        self.register_buffer("sin_tables", freqs.sin(), persistent=False)

    def forward(self, x: torch.Tensor, token_positions: torch.Tensor = None) -> torch.Tensor:
        """
        对输入张量应用 RoPE 旋转。
        x: (batch, seq_len, num_heads, head_dim)
        token_positions: 可选，用于支持非连续位置编码 (如 KV Cache 场景)
        """
        b, seq, h, d = x.shape

        # 将 head_dim 拆分为偶数维和奇数维，对应二维子空间的两个分量
        x_even = x[..., 0::2]
        x_odd = x[..., 1::2]

        # 根据位置索引获取对应的 cos 和 sin 值
        if token_positions is None:
            cos = self.cos_tables[:seq]   # shape: (seq, d/2)
            sin = self.sin_tables[:seq]
        else:
            cos = self.cos_tables[token_positions]
            sin = self.sin_tables[token_positions]

        # 增加维度以适配广播机制 (Broadcasting)
        # shape: (seq, 1, d/2) -> 广播至 (batch, seq, heads, d/2)
        # (1, seq_len, 1, head_dim / 2)
        cos = cos.unsqueeze(1)
        sin = sin.unsqueeze(1)

        # 二维旋转操作
        x_rot_even = x_even * cos - x_odd * sin
        x_rot_odd  = x_even * sin + x_odd * cos

        # 将旋转后的偶数维和奇数维重新合并
        out = torch.empty_like(x)
        out[..., 0::2] = x_rot_even
        out[..., 1::2] = x_rot_odd

        return out
```
## 5. Transformer Block: Core Computation Unit

### 5.1 Block Overview

Transformer Block 构成了现代大语言模型（LLM）的基础计算单元。在自回归架构中，模型通常由 $L$ 个结构相同的 Transformer Block 堆叠而成。每个 Block 内部包含两个子模块：多头自注意力机制（Multi-Head Self-Attention）与前馈神经网络（Feed-Forward Network, FFN）。

为提升深层网络的训练稳定性与收敛速度，当代主流模型（如 LLaMA、Mistral 等）普遍采用 Pre-Normalization（Pre-Norm）架构。Pre-Normalization 将归一化操作置于子模块之前，并通过残差连接（Residual Connection）维持信息流。设第 $l$ 层的输入为 $x_l$，则前向传播可表示为：
$$
\begin{aligned}
x_l' &= x_l + \text{Attention}(\text{RMSNorm}(x_l)) \\
x_{l+1} &= x_l' + \text{FFN}(\text{RMSNorm}(x_l'))
\end{aligned}
$$
该结构有效缓解了深层网络中的梯度衰减问题，并确保了信号在跨层传递过程中的幅值稳定性。

![[figures/QQ_1783406566611.png]]
### 5.2 Self-Attention

自注意力机制(Self-Attention)是 Transformer 架构的核心 insight 之一，Self-Attention 通过计算序列内所有 token 的关联权重，实现全局上下文的动态建模。
#### 5.2.1 Single-Head Attention

给定输入序列的嵌入表示 $X \in \mathbb{R}^{N \times d}$（其中 $N$ 为序列长度，$d$ 为特征维度），模型首先通过三个可学习的线性投影矩阵 $W_Q, W_K, W_V \in \mathbb{R}^{d \times d_k}$ 将其映射为 Query、Key 与 Value 矩阵：
$$
Q = XW_Q, \quad K = XW_K, \quad V = XW_V
$$
随后，计算注意力权重矩阵（Attention Matrix）：
$$
A = \text{Softmax}\left( \frac{QK^T}{\sqrt{d_k}} \right)
$$
其中，缩放因子 $\frac{1}{\sqrt{d_k}}$ 用于防止点积结果过大导致 Softmax 函数进入梯度饱和区。该矩阵 $A \in \mathbb{R}^{N \times N}$ 的每个元素 $A_{ij}$ 表征了第 $i$ 个 token 对第 $j$ 个 token 的语义关注度，所有行向量均满足概率分布约束（$\sum_j A_{ij} = 1$）。

最终，输出表示为 Value 矩阵的加权聚合：
$$
\text{Attention}(Q, K, V) = \text{Softmax}\left( \frac{QK^T}{\sqrt{d_k}} \right)V
$$
通过该机制，模型实现了 Token-to-token 的全局信息交互，每个位置的输出均融合了序列中所有其他位置的上下文语义。
```python
def ScaledDotProductAttention(
    q: torch.Tensor,
    k: torch.Tensor,
    v: torch.Tensor,
    mask: torch.Tensor = None
) -> torch.Tensor:
    # q: query.shape = (batch_size,...,seq_len,d_k)
    # k: key.shape = (batch_size,...,seq_len,d_k)
    # v: value.shape = (batch_size,...,seq_len,d_v)
    d_k = q.shape[-1]
    # (batch_size,...,seq_len,seq_len)
    attn_scores = (q @ k.transpose(-2, -1)) / math.sqrt(d_k)
    # Apply mask
    if mask is not None:
        attn_scores = attn_scores.masked_fill(~mask, float("-inf"))
    # Softmax 沿最后一个维度计算
    attn_scores = softmax(attn_scores, d=-1)
    # (batch_size,...,seq_len,d_v)
    return attn_scores @ v
```
#### 5.2.2 Multi-Head Attention
尽管单头自注意力机制能够实现全局上下文聚合，但其仅在单一的表示子空间内计算 token 间的相似度，这限制了模型捕获复杂且多样化语义关系的能力。因此，Transformer 引入了多头自注意力机制（Multi-Head Attention, MHA）。

多头机制的核心思想是将高维特征空间划分为多个低维的正交子空间，使模型能够在不同的表示子空间中并行地关注不同位置的信息。具体而言，设注意力头数为 $h$，每个头的维度为 $d_k = d/h$。对于第 $i$ 个头，模型使用独立的线性投影矩阵 $W_Q^{(i)}, W_K^{(i)}, W_V^{(i)} \in \mathbb{R}^{d \times d_k}$ 将输入映射到该头的子空间中，并独立计算单头注意力：
$$
\text{head}_i = \text{Attention}(X W_Q^{(i)}, X W_K^{(i)}, X W_V^{(i)})
$$
随后，将所有头的输出在特征维度上进行拼接（Concatenation），并通过一个统一的输出投影矩阵 $W_O \in \mathbb{R}^{d \times d}$ 进行线性变换，以融合多子空间的信息：
$$
\text{MultiHead}(X) = \text{Concat}(\text{head}_1, \text{head}_2, \ldots, \text{head}_h) W_O
$$

在实际的深度学习框架中，若为每个头分别执行矩阵乘法，会导致计算效率低下。因此，通常将 $h$ 个头的投影矩阵在行或列方向上拼接，构造出大维度的权重矩阵（如 $W_Q \in \mathbb{R}^{d \times d}$），通过一次大规模矩阵乘法完成所有头的投影。随后利用 Tensor Reshape 与转置操作，将多头计算转化为高度并行的批处理矩阵乘法（Batched Matrix Multiplication）。这种设计在保持数学等价性的同时，最大化了现代 GPU 的硬件利用率。

```python
class MultiHeadAttention(nn.Module):
    def __init__(self, d_model: int, num_heads: int):
        super().__init__()
        # d_model: int Dimensionality of the Transformer block inputs.
        # num_heads: int Number of heads to use in multi-head self-attention.
        assert d_model % num_heads == 0

        self.d_model = d_model
        self.num_heads = num_heads
        self.d_head = d_model // num_heads

        self.wq = Linear(self.d_model, self.d_model)
        self.wk = Linear(self.d_model, self.d_model)
        self.wv = Linear(self.d_model, self.d_model)

        self.wo = Linear(self.d_model, self.d_model)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Assume x.shape=(batch_size,seq_length,d_model)
        B, S, D = x.shape
        Q = self.wq(x)
        K = self.wk(x)
        V = self.wv(x)

        # Q.shape = (Batch_size,seq_length,d_model)
        Q = Q.view(B, S, self.num_heads, self.d_head).transpose(1, 2)
        K = K.view(B, S, self.num_heads, self.d_head).transpose(1, 2)
        V = V.view(B, S, self.num_heads, self.d_head).transpose(1, 2)

        # Q.shape = (Batch_size,num_heads,seq_length,d_head)

        # 为什么做这一步转置呢？如果不做转置，Q.shape=(Batch_size,seq_length,num_heads,d_heads)

        # 输入到自注意力机制当中后，其输出为(B,S,H,H)，而转置后的输出为(B,H,S,D_h)

        attn_out = ScaledDotProductAttention(Q, K, V, mask=None)

        attn_out = (
            attn_out
            .transpose(1, 2)
            .contiguous()
            .view(B, S, D)
        )
        attn_out = self.wo(attn_out)
        return attn_out
```

### 5.3 Pre-Normalization
![[figures/QQ_1783406600457.png]]
在 Transformer Block 中，Pre-Normalization 指将 Norm 层放置在残差连接之前。在现代语言模型中，通常采用 RMSNorm (Root Mean Square Layer Normalization) 的方式进行归一化，RMSNorm 仅基于均方根进行缩放，相较于 LayerNorm，省去了计算均值的步骤。
$$
 \text{RMSNorm}(x) = \frac{x}{\sqrt{\text{RMS}(x) + \epsilon}} \odot \gamma, \quad \text{其中 } \text{RMS}(x) = \sqrt{\frac{1}{d}\sum_{i=1}^{d} x_i^2}
$$
其中 $\gamma \in \mathbb{R}^d$ 为一可学习的缩放参数，$\epsilon$ 为数值稳定常数。

其 PyTorch 代码实现如下：
```python
class RMSNorm(nn.Module):
    def __init__(self,d_model: int,eps: float = 1e-5,device: torch.device = None,dtype:
                 torch.dtype = None):
        # d_model: int Hidden dimension of the model
        # eps: float = 1e-5 Epsilon value for numerical stability
        # device: torch.device | None = None Device to store the parameters on
        # dtype: torch.dtype | None = None Data type of the parameters
        super().__init__()
        self.d_model = d_model
        self.eps = eps
        self.weight = nn.Parameter(
            torch.ones(
                (d_model,),
                device=device,
                dtype=dtype,
            )
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        in_dtype = x.dtype
        x = x.to(torch.float32)
        rms = torch.sqrt(
            x.pow(2).mean(dim=-1, keepdim=True) + self.eps
        )
        result = (x / rms) * self.weight
        return result.to(in_dtype)
```
除此之外，现代语言模型更广泛引入了 SwiGLU (Swish-Gated Linear Unit) 结构，以增强模型的表达能力与梯度平滑性。

SwiGLU 的核心在于引入门控机制（Gating Mechanism）与隐层维度扩展（Hidden Expansion）。其数学表达为：
$$
\text{FFN}(x) = \left( \text{Swish}_\beta(xW_1) \odot (xW_2) \right) W_3
$$
其中：
- $W_1, W_2 \in \mathbb{R}^{d \times d_{ff}}$ 为上投影矩阵，$W_3 \in \mathbb{R}^{d_{ff} \times d}$ 为下投影矩阵。通常取扩展比例 $d_{ff} = 4d \sim 8d$。
- $\text{Swish}_\beta(z) = z \cdot \sigma(\beta z)$ 为平滑激活函数。
- $\odot$ 表示哈达玛积。

SwiGLU 的 PyTorch 实现如下所示：
```python
def SiLU(x:torch.Tensor)->torch.Tensor:
    return x * torch.sigmoid(x)

class SwiGLU(nn.Module):
    def __init__(self, d_model):
        super().__init__()
        self.d_model = d_model
        self.d_ff = ((self.d_model * 8 // 3 + 63) // 64) * 64
        self.w1 = Linear(self.d_model,self.d_ff)
        self.w2 = Linear(self.d_ff,self.d_model)
        self.w3 = Linear(self.d_model,self.d_ff)

    def forward(self, x:torch.Tensor)->torch.Tensor:
        return self.w2(SiLU(self.w1(x))*self.w3(x))
```
由此可构成一个完整的 Transformer Block：
```python
class TransformerBlock(nn.Module):
    def __init__(self, d_model: int, num_heads: int, d_ff: int):
        super().__init__()

        # d_model: int Dimensionality of the Transformer block inputs.
        # num_heads: int Number of heads to use in multi-head self-attention.
        # d_ff: int Dimensionality of the position-wise feed-forward inner layer.
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_ff = d_ff

        self.RMSNorm = RMSNorm(self.d_model)
        self.ffn = SwiGLU(self.d_model, self.d_ff)
        self.MultiHeadAttention = MultiHeadAttention(self.d_model, self.num_heads)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # input shape: batch_size, seq_len, d_model
        tmp = x + self.MultiHeadAttention(self.RMSNorm(x))
        return tmp + self.ffn(self.RMSNorm(tmp))
```

## 7. Language Modeling Head
经过 $L$ 层 Transformer Block 的逐层抽象后，输入序列被映射为高维隐状态矩阵 $H^{(L)} \in \mathbb{R}^{N \times d_{model}}$。然而，该隐状态处于高度抽象的连续语义空间中，无法直接用于离散的文本生成。语言模型头（Language Modeling Head, LM Head）即是将这 $d_{model}$ 维的语义向量重新投影回大小为 $V$（Vocabulary Size）的离散词汇表空间。

### 7.1 线性投影与 Logits 生成
LM Head 本质上是一个无偏置项的线性变换层。对于序列中的每一个 Token 隐状态 $h_i \in \mathbb{R}^{d_{model}}$，其输出的未归一化对数几率（Logits） $z_i \in \mathbb{R}^V$ 计算如下：
$$
z_i = h_i W_{head}^T
$$
其中 $W_{head} \in \mathbb{R}^{V \times d_{model}}$ 为 LM Head 的权重矩阵。输出的张量形状为 `(Batch_Size, Seq_Len, Vocab_Size)`。

#### 7.1.1 投影过程的张量演变与几何本质
为说明从连续空间到离散空间的映射机制，我们设定一组超参数进行推演：假设批次大小 $B=2$，序列长度 $S=4$，隐藏层维度 $d_{model}=512$，词汇表大小 $V=32000$。

1. **连续语义表征 (Hidden States)**：经过 Transformer 编码后，隐状态张量 $H^{(L)}$ 的形状为 `[2, 4, 512]`。此时，每个 Token 由一个 512 维的连续浮点向量表示。
2. **离散符号的连续坐标 (LM Head Weights)**：权重矩阵 $W_{head}$ 的形状为 `[32000, 512]`。其每一行代表词汇表中一个特定离散 Token 在 512 维连续空间中的“标准语义坐标”。
3. **相似度度量与 Logits 生成 (Projection)**：在执行矩阵乘法 $Z = H^{(L)} W_{head}^T$ 时，转置后的权重矩阵 $W_{head}^T$ 形状为 `[512, 32000]`。利用张量广播机制，`[2, 4, 512]` 与 `[512, 32000]` 进行批量矩阵乘法（Batched Matrix Multiplication），输出 Logits 张量 $Z$ 的形状为 `[2, 4, 32000]`。

在代数与几何层面上，$Z$ 中任意位置 $(b, s, v)$ 的元素 $z_{b,s,v}$，本质上是隐状态向量 $h_{b,s}$ 与词汇表中第 $v$ 个词的目标向量 $w_v$ 的**内积（Dot Product）**。内积是连续向量空间中衡量方向相似度（未归一化的余弦相似度）的核心度量。因此，该投影过程意义在于：计算当前 Token 的连续隐状态与词汇表中所有 32000 个离散词汇标准向量之间的相似度得分。这 32000 个原始得分即构成了用于后续分类的 Logits，从而成功将“连续的语义距离”转化为“离散的分类偏好”。

在绝大多数现代自回归语言模型（如 GPT 系列、LLaMA 等）中，LM Head 的权重矩阵 $W_{head}$ 并非独立训练，而是与输入端的 Token Embedding 矩阵 $W_{embed}$ 共享，即 $W_{head} = W_{embed}$。这一设计不仅大幅减少了模型的参数量，更强制了输入表征空间与输出预测空间的语义对齐。

```python
class LMHead(nn.Module):
    def __init__(self, embedding_layer: nn.Embedding):
        super().__init__()
        # 共享 Embedding 层的权重 (Weight Tying)
        # 此处为引用传递，反向传播时梯度会自动累加至同一底层 Tensor
        self.weight = embedding_layer.weight 

    def forward(self, hidden_states: torch.Tensor) -> torch.Tensor:
        # hidden_states: (batch, seq_len, d_model)
        # logits: (batch, seq_len, vocab_size)
        return F.linear(hidden_states, self.weight) 
```

## 8. Probability Interpretation (Softmax)
LM Head 输出的 Logits 张量 $Z \in \mathbb{R}^{B \times S \times V}$ 仅代表模型对各个候选 Token 的未归一化偏好得分（Raw Scores），其取值范围为 $(-\infty, +\infty)$。为了将其转化为严格的概率分布，以形式化 Next-Token Prediction 的条件概率 $p(x_{t+1} \mid x_{1:t})$，必须应用 Softmax 函数。

### 8.1 从 Logits 到概率分布
对于批次中特定位置 $t$ 的 Logits 向量 $z^{(t)} \in \mathbb{R}^V$，其预测词汇表中第 $v$ 个 Token 的概率为：
$$
P(x_{t+1} = v \mid x_{1:t}) = \frac{\exp(z_v^{(t)})}{\sum_{j=1}^{V} \exp(z_j^{(t)})}
$$
在实际工程实现中，该操作作用于张量的最后一个维度（即 $V$ 维度）。通过 Softmax 映射，输出向量满足了概率论的两个基本公理：非负性（$P \ge 0$）与归一性（$\sum P = 1$），从而在离散的 $V$ 维空间上构建了一个严谨的多项式分布（Multinomial Distribution）。

*注：在实际的 PyTorch 工程实现中，为避免指数运算导致的数值溢出（Overflow），Softmax 内部通常采用 LogSumExp 技巧进行数值稳定性优化，即先减去向量中的最大值再进行 $\exp$ 运算。*

### 8.2 温度系数 (Temperature Scaling)
在推理阶段（Inference），为了控制模型生成的随机性与多样性，通常在 Softmax 之前引入温度系数 $\tau$（Temperature）：
$$
P(v) = \frac{\exp(z_v / \tau)}{\sum_{j=1}^{V} \exp(z_j / \tau)}
$$
- 当 $\tau \to 0$ 时，分布趋于 Dirac 分布（One-hot），模型表现出极强的确定性（Greedy Decoding）。
- 当 $\tau \to \infty$ 时，分布趋于均匀分布（Uniform Distribution），模型输出完全随机。
- 当 $\tau = 1$ 时，即为模型训练时的原始概率分布。

## 9. Training Objective: Cross-Entropy Loss

语言模型的训练本质上是**极大似然估计（Maximum Likelihood Estimation, MLE）**。给定一个长度为 $N$ 的训练序列 $X = (x_1, x_2, \ldots, x_N)$，模型的目标是最大化该序列在模型参数 $\theta$ 下的联合条件概率：
$$
\max_\theta \prod_{t=1}^{N} P_\theta(x_t \mid x_{<t})
$$
为便于梯度下降优化，通常对其取负对数，转化为最小化**交叉熵损失（Cross-Entropy Loss）**，即负对数似然（Negative Log-Likelihood, NLL）：
$$
\mathcal{L}_{CE} = -\sum_{t=1}^{N} \log P_\theta(x_t \mid x_{<t})
$$

### 9.1 张量维度的演变与损失计算

在深度学习框架（如 PyTorch）的实际工程实现中，交叉熵损失的计算需要严格对齐预测分布与真实标签的张量形状。承接前文，假设批次大小（Batch Size）为 $B$，序列长度（Sequence Length）为 $S$，词汇表大小（Vocabulary Size）为 $V$。

1. **预测分布（Predictions）**：
   经过第 7 节的 LM Head 线性投影后，模型输出的未归一化对数几率（Logits）张量 `logits` 的形状为 `(B, S, V)`。
2. *注：在实际计算中，为避免数值下溢并提高计算效率，通常跳过第 8 节显式的 Softmax 概率映射，直接使用 `logits` 结合底层算子进行计算。*
3. **真实标签（Targets）**：
   在自回归语言模型的训练数据构造中，目标序列通常为输入序列向右平移一位的结果。因此，真实目标张量 `targets` 由离散的 Token IDs 组成，其形状同样为 `(B, S)`。其中，`targets[b, s]` 表示第 $b$ 个样本在时间步 $s$ 需要预测的真实下一个 Token ID（即 $x_{s+1}$）。

4. **维度展平与批量计算（Flattening and Batch Computation）**：
   为了高效计算所有样本在所有时间步上的损失，通常需要将三维张量展平为二维或一维形式，以适配标准分类损失函数的输入要求：
   - `logits` 从 `(B, S, V)` 变形（View/Reshape）为 `(B * S, V)`。
   - `targets` 从 `(B, S)` 变形为 `(B * S,)`。
   
   此时，问题转化为对 $B \times S$ 个独立样本进行多分类计算。对于展平后的第 $i$ 个样本（对应原始批次中的某个特定时间步），其真实标签为 $y_i \in \{1, 2, \ldots, V\}$，模型输出的 Logits 为 $z_i \in \mathbb{R}^V$。该样本的交叉熵损失计算为：
   $$
   \mathcal{L}_i = -\log \left( \frac{\exp(z_{i, y_i})}{\sum_{j=1}^{V} \exp(z_{i, j})} \right) = -z_{i, y_i} + \log \sum_{j=1}^{V} \exp(z_{i, j})
   $$

5. **损失聚合（Loss Reduction）**：
   最终的全局损失 $\mathcal{L}_{CE}$ 通常是对所有 $B \times S$ 个位置上的个体损失求平均值（Mean Reduction）：
   $$
   \mathcal{L}_{CE} = \frac{1}{B \times S} \sum_{i=1}^{B \times S} \mathcal{L}_i
   $$
   这一标量值（形状为 `()`）即为反向传播（Backpropagation）的起点，用于计算梯度 $\nabla_\theta \mathcal{L}_{CE}$ 并更新模型参数。

以下为您补充的第 10 章内容。本章将深入探讨现代大语言模型训练的核心优化器 AdamW，并严格结合前文的网络结构，通过具体的 `tensor.shape` 演变来解析其底层计算与内存管理机制。

## 10. Optimization: AdamW and Decoupled Weight Decay

在确立了模型的前向传播与损失计算（Cross-Entropy Loss）后，我们需要通过反向传播计算梯度，并利用优化器更新模型参数 $\theta$。在现代大语言模型（LLM）的训练中，AdamW 已成为事实上的标准优化器。相较于传统的 SGD 或 Adam，AdamW 通过解耦权重衰减（Decoupled Weight Decay），在保持自适应学习率优势的同时，显著提升了模型的泛化能力与训练稳定性。
### 10.1 AdamW 的数学原理

AdamW 结合了动量法（Momentum）与自适应学习率（RMSProp）的思想，并修正了 Adam 中权重衰减的实现方式。

对于模型中的每一个可学习参数 $\theta$，AdamW 维护两个与 $\theta$ 形状完全相同的状态变量：
- **一阶矩估计（First Moment Estimate, $m_t$）**：梯度的指数移动平均，相当于动量。
- **二阶矩估计（Second Moment Estimate, $v_t$）**：梯度平方的指数移动平均，用于自适应调整每个参数的学习率。

在时间步 $t$，给定参数的梯度 $g_t = \nabla_\theta \mathcal{L}_{CE}$，AdamW 的更新规则如下：
1. **更新一阶矩和二阶矩**：
   $$
   m_t = \beta_1 m_{t-1} + (1 - \beta_1) g_t
   $$
   $$
   v_t = \beta_2 v_{t-1} + (1 - \beta_2) g_t^2
   $$
2. **偏差修正（Bias Correction）**：
   $$ \hat{m}_t = \frac{m_t}{1 - \beta_1^t}, \quad \hat{v}_t = \frac{v_t}{1 - \beta_2^t} $$
3. **参数更新（解耦权重衰减）**：
   $$ \theta_t = \theta_{t-1} - \eta \left( \frac{\hat{m}_t}{\sqrt{\hat{v}_t} + \epsilon} + \lambda \theta_{t-1} \right) $$

其中，$\eta$ 为学习率，$\lambda$ 为权重衰减系数（Weight Decay）。

**关键 Insight**：在原始 Adam 中，L2 正则化项被直接加到损失函数中，导致其梯度参与了 $m_t$ 和 $v_t$ 的计算，这会破坏自适应学习率的估计。AdamW 将权重衰减项 $\lambda \theta_{t-1}$ 从梯度计算中剥离，直接在参数更新步进行缩放，从而实现了真正的 $L_2$ 正则化效果。

### 10.2 张量维度的演变与状态维护

在 LLM 中，AdamW 需要为模型中的**每一个**可学习参数维护独立的状态张量。这意味着优化器本身的内存占用（Optimizer States）往往是模型参数量的数倍。我们以第 5 节中的 Multi-Head Attention 为例，剖析 AdamW 在参数更新时的张量形状（`tensor.shape`）演变。

假设批次大小 $B=2$，序列长度 $S=4$，隐藏层维度 $d_{model}=512$，注意力头数 $h=8$，则每个头的维度 $d_k = 64$。对于投影矩阵 $W_Q$，其原始形状为 `(d_model, d_model)`，即 `(512, 512)`。

1. **梯度计算（Backward Pass）**：
   反向传播后，`W_Q.grad` 的形状与参数本身完全一致，即 `(512, 512)`。
2. **状态初始化（State Initialization）**：
   在第一次更新时，AdamW 会初始化与 `W_Q` 形状相同的全零张量作为一阶矩 $m$ 和二阶矩 $v$：
   - `state['exp_avg']` (即 $m_t$) : `torch.zeros_like(W_Q)` $\rightarrow$ shape `(512, 512)`
   - `state['exp_avg_sq']` (即 $v_t$) : `torch.zeros_like(W_Q)` $\rightarrow$ shape `(512, 512)`
3. **逐元素更新（Element-wise Update）**：
   在后续的每一个训练步中，上述数学公式中的加减乘除运算均是**逐元素（Element-wise）** 进行的。
   - $g_t$ (`W_Q.grad`) 形状为 `(512, 512)`。
   - $m_t$ 和 $v_t$ 的更新保持 `(512, 512)` 不变。
   - 偏差修正后的 $\hat{m}_t$ 和 $\hat{v}_t$ 形状仍为 `(512, 512)`。
   - 最终的参数更新步：
     $$ \Delta \theta = \eta \left( \frac{\hat{m}_t}{\sqrt{\hat{v}_t} + \epsilon} + \lambda \theta_{t-1} \right) $$
     其中，$\frac{\hat{m}_t}{\sqrt{\hat{v}_t} + \epsilon}$ 形状为 `(512, 512)`，$\lambda \theta_{t-1}$ 形状亦为 `(512, 512)`。两者相加后，从 $\theta_{t-1}$ 中减去，完成参数更新。

**内存占用分析**：
对于 $W_Q$ (512x512)，如果采用混合精度训练（如 BF16），参数本身占用 $512 \times 512 \times 2$ bytes $\approx 0.5$ MB。而 AdamW 的状态 $m$ 和 $v$ 通常必须保持 FP32 以确保数值稳定性，因此状态占用 $512 \times 512 \times 4 \times 2$ bytes $\approx 2$ MB。优化器状态内存是参数内存的 4 倍。对于包含数十亿参数的 LLM，优化器状态往往占据 GPU 显存的绝大部分。
