"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookHeart,
  Check,
  Copy,
  FolderPlus,
  ImagePlus,
  Link2,
  LoaderCircle,
  LockKeyhole,
  Pencil,
  Plus,
  RefreshCw,
  Shirt,
  Trash2,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { getGarment, getPalette } from "@/lib/catalog";
import type { Lookbook, SavedLook } from "@/lib/types";
import { AuthDialog } from "./auth-dialog";
import { Dialog } from "./dialog";
import { OutfitFigure } from "./outfit-figure";
import { ShareDialog } from "./share-dialog";

type ShareTarget = { kind: "look" | "lookbook"; id: string; name: string; token?: string | null };
type DeleteTarget = { kind: "look" | "lookbook"; id: string; name: string };
const errorText = (cause: unknown) =>
  cause instanceof Error ? cause.message : "Chưa thể hoàn thành thao tác. Hãy thử lại.";

export function LookbookManager() {
  const { data: session, isPending, error, refetch } = authClient.useSession();
  const [authOpen, setAuthOpen] = useState(false);
  if (isPending)
    return (
      <div className="empty-page" role="status">
        <LoaderCircle className="spin" size={25} />
        <p>Đang mở góc riêng của bạn…</p>
      </div>
    );
  if (!session)
    return (
      <>
        <section className="empty-page">
          <BookHeart size={45} strokeWidth={1} />
          <span className="eyebrow">LOOKBOOK CỦA TÔI</span>
          <h1>Gu của bạn, một góc riêng.</h1>
          <p>
            Lưu lại những bộ phối yêu thích, gom thành những câu chuyện nhỏ và gửi một chút gu Việt
            đến bạn bè.
          </p>
          {error && (
            <div className="notice notice-error" role="alert">
              Chưa thể kiểm tra phiên đăng nhập.{" "}
              <button className="text-button" onClick={() => void refetch()}>
                Thử lại
              </button>
            </div>
          )}
          <button className="button button-primary" onClick={() => setAuthOpen(true)}>
            Đăng nhập để mở lookbook <ArrowRight size={17} />
          </button>
          <Link href="/phong-phoi" className="text-link">
            Ghé phòng phối trước <ArrowRight size={14} />
          </Link>
          <p className="fine-print">
            Bộ phối và lookbook mặc định riêng tư. Bạn quyết định khi nào chia sẻ.
          </p>
        </section>
        <AuthDialog
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          onSuccess={() => void refetch()}
        />
      </>
    );
  return <PersonalLibrary key={session.user.id} userName={session.user.name} />;
}

function PersonalLibrary({ userName }: { userName: string }) {
  const [looks, setLooks] = useState<SavedLook[]>([]);
  const [books, setBooks] = useState<Lookbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<"books" | "looks">("books");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editor, setEditor] = useState<Lookbook | "new" | null>(null);
  const [renaming, setRenaming] = useState<SavedLook | null>(null);
  const [adding, setAdding] = useState<SavedLook | null>(null);
  const [sharing, setSharing] = useState<ShareTarget | null>(null);
  const [deleting, setDeleting] = useState<DeleteTarget | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const requestVersion = useRef(0);

  const refresh = useCallback(async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    setError("");
    const result = await Promise.allSettled([
      api<{ looks: SavedLook[] }>("/api/looks"),
      api<{ lookbooks: Lookbook[] }>("/api/lookbooks"),
    ]);
    if (version !== requestVersion.current) return;
    const failure = result.find((item) => item.status === "rejected");
    if (failure?.status === "rejected") {
      setError(errorText(failure.reason));
      if (failure.reason instanceof ApiError && failure.reason.status === 401) setAuthOpen(true);
    } else if (result[0].status === "fulfilled" && result[1].status === "fulfilled") {
      setLooks(result[0].value.looks);
      setBooks(result[1].value.lookbooks);
      setLoaded(true);
      setSelectedId((current) =>
        current &&
        result[1].status === "fulfilled" &&
        result[1].value.lookbooks.some((book) => book.id === current)
          ? current
          : null,
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => void refresh(), 0);
    return () => {
      window.clearTimeout(task);
      requestVersion.current += 1;
    };
  }, [refresh]);

  function fail(cause: unknown) {
    setError(errorText(cause));
    if (cause instanceof ApiError && cause.status === 401) setAuthOpen(true);
  }

  function replaceBook(book: Lookbook) {
    setBooks((current) =>
      current.some((item) => item.id === book.id)
        ? current.map((item) => (item.id === book.id ? book : item))
        : [book, ...current],
    );
  }

  function replaceLook(look: SavedLook) {
    setLooks((current) =>
      current.some((item) => item.id === look.id)
        ? current.map((item) => (item.id === look.id ? look : item))
        : [look, ...current],
    );
    setBooks((current) =>
      current.map((book) => ({
        ...book,
        looks: book.looks.map((item) => (item.id === look.id ? look : item)),
      })),
    );
  }

  async function duplicate(look: SavedLook) {
    if (busyId) return;
    setBusyId(look.id);
    setError("");
    setNotice("");
    try {
      const { look: copy } = await api<{ look: SavedLook }>("/api/looks", {
        method: "POST",
        body: JSON.stringify({ name: `${look.name.slice(0, 90)} · Bản sao`, config: look.config }),
      });
      replaceLook(copy);
      setNotice(`Đã tạo “${copy.name}”. Bản sao được lưu riêng tư.`);
    } catch (cause) {
      fail(cause);
    } finally {
      setBusyId(null);
    }
  }

  async function remove() {
    if (!deleting || busyId) return;
    setBusyId(deleting.id);
    setDeleteError("");
    try {
      await api(`/api/${deleting.kind === "look" ? "looks" : "lookbooks"}/${deleting.id}`, {
        method: "DELETE",
      });
      forgetDeleted(deleting);
      setNotice(
        deleting.kind === "look"
          ? "Đã xóa bộ phối và gỡ khỏi các lookbook. Thao tác này không thể hoàn tác."
          : "Đã xóa lookbook. Các bộ phối vẫn còn trong mục Bộ phối đã lưu.",
      );
      setDeleting(null);
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 404) {
        forgetDeleted(deleting);
        setDeleting(null);
        setNotice("Nội dung này đã được xóa ở nơi khác. Thư viện đã được cập nhật.");
      } else {
        setDeleteError(errorText(cause));
        if (cause instanceof ApiError && cause.status === 401) setAuthOpen(true);
      }
    } finally {
      setBusyId(null);
    }
  }

  function forgetDeleted(target: DeleteTarget) {
    if (target.kind === "lookbook") {
      setBooks((current) => current.filter((item) => item.id !== target.id));
      if (selectedId === target.id) setSelectedId(null);
    } else {
      setLooks((current) => current.filter((item) => item.id !== target.id));
      setBooks((current) =>
        current.map((book) => ({
          ...book,
          looks: book.looks.filter((item) => item.id !== target.id),
          coverLookId: book.coverLookId === target.id ? null : book.coverLookId,
        })),
      );
    }
  }

  function shared(token: string | null) {
    if (!sharing) return;
    if (sharing.kind === "lookbook")
      setBooks((current) =>
        current.map((item) => (item.id === sharing.id ? { ...item, shareToken: token } : item)),
      );
    else {
      const look = looks.find((item) => item.id === sharing.id);
      if (look) replaceLook({ ...look, shareToken: token });
    }
    setSharing({ ...sharing, token });
  }

  const selected = books.find((book) => book.id === selectedId);
  const displayedLooks = selected
    ? selected.looks.map((item) => looks.find((look) => look.id === item.id) ?? item)
    : looks;
  const affectedBooks =
    deleting?.kind === "look"
      ? books.filter((book) => book.looks.some((look) => look.id === deleting.id))
      : [];

  function lookCard(look: SavedLook) {
    const sharedInBook = books.some(
      (book) => book.shareToken && book.looks.some((item) => item.id === look.id),
    );
    return (
      <article className="saved-card" key={look.id}>
        <Link
          href={`/phong-phoi?look=${look.id}`}
          className="saved-card-art"
          aria-label={`Mở bộ phối ${look.name}`}
        >
          <OutfitFigure config={look.config} />
        </Link>
        <div className="saved-card-body">
          <h3 style={{ overflowWrap: "anywhere" }}>{look.name}</h3>
          <p>
            {getGarment(look.config.garment).name} · {getPalette(look.config.primaryColor).name}
          </p>
          <span className="status-pill">
            {look.shareToken
              ? "Link riêng đang bật"
              : sharedInBook
                ? "Có trong lookbook chia sẻ"
                : "Riêng tư"}
          </span>
          <div className="card-actions">
            <Link className="text-link" href={`/phong-phoi?look=${look.id}`}>
              Chỉnh phối <ArrowRight size={12} />
            </Link>
            <div className="row wrap" style={{ gap: 2 }}>
              <button
                className="icon-button"
                title="Chia sẻ"
                aria-label={`Chia sẻ ${look.name}`}
                onClick={() =>
                  setSharing({ kind: "look", id: look.id, name: look.name, token: look.shareToken })
                }
              >
                <Link2 size={15} />
              </button>
              <button
                className="icon-button"
                title="Thêm vào lookbook"
                aria-label={`Thêm ${look.name} vào lookbook`}
                onClick={() => setAdding(look)}
              >
                <FolderPlus size={15} />
              </button>
              <button
                className="icon-button"
                title="Nhân bản"
                aria-label={`Nhân bản ${look.name}`}
                disabled={!!busyId}
                onClick={() => void duplicate(look)}
              >
                {busyId === look.id ? (
                  <LoaderCircle size={15} className="spin" />
                ) : (
                  <Copy size={15} />
                )}
              </button>
              <button
                className="icon-button"
                title="Đổi tên"
                aria-label={`Đổi tên ${look.name}`}
                onClick={() => setRenaming(look)}
              >
                <Pencil size={15} />
              </button>
              <button
                className="icon-button"
                title="Xóa bộ phối"
                aria-label={`Xóa ${look.name}`}
                onClick={() => {
                  setDeleteError("");
                  setDeleting({ kind: "look", id: look.id, name: look.name });
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <>
      <div className="page-heading">
        <div>
          {selected ? (
            <button className="text-link" onClick={() => setSelectedId(null)}>
              <ArrowLeft size={14} />
              Tất cả lookbook
            </button>
          ) : (
            <span className="eyebrow">
              <span className="eyebrow-line" />
              MỘT GÓC RIÊNG CỦA {userName.split(" ").slice(-1)[0]}
            </span>
          )}
          <h1 style={{ overflowWrap: "anywhere" }}>
            {selected ? selected.name : "Lưu lại những điều mình thích."}
          </h1>
          <p className="shared-description">
            {selected
              ? selected.description || "Những bộ phối cùng kể một câu chuyện."
              : "Mỗi bộ phối một cá tính. Mỗi lookbook một câu chuyện."}
          </p>
        </div>
        <div className="row wrap">
          {selected ? (
            <>
              <button
                className="button button-secondary button-small"
                onClick={() => setEditor(selected)}
              >
                <Pencil size={15} />
                Sắp xếp lookbook
              </button>
              <button
                className="button button-primary button-small"
                onClick={() =>
                  setSharing({
                    kind: "lookbook",
                    id: selected.id,
                    name: selected.name,
                    token: selected.shareToken,
                  })
                }
              >
                <Link2 size={15} />
                Chia sẻ
              </button>
            </>
          ) : (
            <>
              <Link className="button button-secondary button-small" href="/phong-phoi">
                <Shirt size={15} />
                Phối đồ mới
              </Link>
              <button
                className="button button-primary button-small"
                disabled={!loaded || loading}
                onClick={() => setEditor("new")}
              >
                <Plus size={16} />
                Tạo lookbook
              </button>
            </>
          )}
        </div>
      </div>
      {error && (
        <div className="notice notice-error row wrap" role="alert" style={{ marginBottom: 20 }}>
          <span style={{ flex: 1 }}>{error}</span>
          <button
            className="button button-ghost button-small"
            disabled={loading}
            onClick={() => void refresh()}
          >
            <RefreshCw size={14} />
            Tải lại thư viện
          </button>
        </div>
      )}
      {notice && (
        <div className="notice row" role="status" style={{ marginBottom: 20 }}>
          <Check size={16} />
          <span style={{ flex: 1 }}>{notice}</span>
          <button className="text-button" onClick={() => setNotice("")}>
            Đóng
          </button>
        </div>
      )}
      {!selected && (
        <div className="tab-bar" role="tablist" aria-label="Nội dung thư viện">
          <button
            role="tab"
            aria-selected={tab === "books"}
            className={tab === "books" ? "active" : ""}
            onClick={() => setTab("books")}
          >
            Lookbook<span>{books.length}</span>
          </button>
          <button
            role="tab"
            aria-selected={tab === "looks"}
            className={tab === "looks" ? "active" : ""}
            onClick={() => setTab("looks")}
          >
            Bộ phối đã lưu<span>{looks.length}</span>
          </button>
          <button
            className="icon-button"
            onClick={() => void refresh()}
            disabled={loading}
            aria-label="Tải lại thư viện"
            title="Tải lại thư viện"
            style={{ marginLeft: "auto" }}
          >
            <RefreshCw size={15} className={loading ? "spin" : ""} />
          </button>
        </div>
      )}
      {selected && (
        <div className="share-banner">
          <span>
            {selected.shareToken ? (
              <>
                <Link2 size={13} style={{ display: "inline", verticalAlign: "middle" }} /> Link đang
                bật · Tất cả {selected.looks.length} bộ phối trong lookbook đều được chia sẻ.
              </>
            ) : (
              <>
                <LockKeyhole size={13} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
                Lookbook riêng tư · {selected.looks.length} bộ phối
              </>
            )}
          </span>
          <button
            className="text-button"
            onClick={() => {
              setDeleteError("");
              setDeleting({ kind: "lookbook", id: selected.id, name: selected.name });
            }}
          >
            Xóa lookbook
          </button>
        </div>
      )}
      {loading && !loaded ? (
        <div className="empty-state" role="status">
          <LoaderCircle size={25} className="spin" />
          <p>Đang lấy những bộ phối của bạn…</p>
        </div>
      ) : !loaded ? (
        <div className="empty-state">
          <BookHeart size={38} strokeWidth={1} />
          <h2>Thư viện chưa tải được.</h2>
          <p>Hãy dùng nút tải lại phía trên để tiếp tục.</p>
        </div>
      ) : selected || tab === "looks" ? (
        displayedLooks.length ? (
          <div className="look-grid" aria-busy={loading}>
            {displayedLooks.map(lookCard)}
          </div>
        ) : (
          <div className="empty-state">
            <Shirt size={42} strokeWidth={1} />
            <h2>{selected ? "Một trang mới đang chờ bạn." : "Bắt đầu từ bộ phối đầu tiên."}</h2>
            <p>
              {selected
                ? "Chọn những bộ phối đã lưu, đặt chúng cạnh nhau và kể câu chuyện bạn thích."
                : "Ghé phòng phối, thử vài sắc màu rồi lưu bộ phối đầu tiên của mình nhé."}
            </p>
            {selected && looks.length ? (
              <button className="button button-primary" onClick={() => setEditor(selected)}>
                <Plus size={16} />
                Thêm bộ phối
              </button>
            ) : (
              <Link className="button button-primary" href="/phong-phoi">
                Mở phòng phối <ArrowRight size={16} />
              </Link>
            )}
          </div>
        )
      ) : books.length ? (
        <div className="collection-grid" aria-busy={loading}>
          {books.map((book) => {
            const cover = book.looks.find((look) => look.id === book.coverLookId) ?? book.looks[0];
            const second = book.looks.find((look) => look.id !== cover?.id);
            return (
              <article className="saved-card" key={book.id}>
                <button
                  className={`book-cover ${!cover ? "placeholder" : second ? "" : "single"}`}
                  onClick={() => setSelectedId(book.id)}
                  aria-label={`Mở lookbook ${book.name}`}
                >
                  {cover ? (
                    <>
                      <OutfitFigure
                        config={(looks.find((look) => look.id === cover.id) ?? cover).config}
                      />
                      {second && (
                        <OutfitFigure
                          config={(looks.find((look) => look.id === second.id) ?? second).config}
                        />
                      )}
                    </>
                  ) : (
                    <BookHeart strokeWidth={1} />
                  )}
                </button>
                <div className="saved-card-body">
                  <h3 style={{ overflowWrap: "anywhere" }}>{book.name}</h3>
                  <div className="book-meta">
                    <p>{book.looks.length} bộ phối</p>
                    <span className="status-pill">
                      {book.shareToken ? "Đang chia sẻ" : "Riêng tư"}
                    </span>
                  </div>
                  {book.description && (
                    <p
                      style={{
                        marginTop: 8,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {book.description}
                    </p>
                  )}
                  <div className="card-actions">
                    <button className="text-link" onClick={() => setSelectedId(book.id)}>
                      Mở lookbook <ArrowRight size={13} />
                    </button>
                    <div className="row" style={{ gap: 4 }}>
                      <button
                        className="icon-button"
                        title="Chia sẻ"
                        aria-label={`Chia sẻ ${book.name}`}
                        onClick={() =>
                          setSharing({
                            kind: "lookbook",
                            id: book.id,
                            name: book.name,
                            token: book.shareToken,
                          })
                        }
                      >
                        <Link2 size={15} />
                      </button>
                      <button
                        className="icon-button"
                        title="Sửa lookbook"
                        aria-label={`Sửa ${book.name}`}
                        onClick={() => setEditor(book)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="icon-button"
                        title="Xóa lookbook"
                        aria-label={`Xóa ${book.name}`}
                        onClick={() => {
                          setDeleteError("");
                          setDeleting({ kind: "lookbook", id: book.id, name: book.name });
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <BookHeart size={44} strokeWidth={1} />
          <h2>Câu chuyện đầu tiên, do bạn đặt tên.</h2>
          <p>
            “Tết này mặc gì”, “Một ngày ở Huế” hay “Gu Việt của mình”? Tạo một lookbook rồi thêm
            những bộ phối yêu thích.
          </p>
          <button className="button button-primary" onClick={() => setEditor("new")}>
            <Plus size={16} />
            Tạo lookbook đầu tiên
          </button>
        </div>
      )}
      {editor && (
        <BookEditor
          key={typeof editor === "string" ? "new" : editor.id}
          book={editor === "new" ? null : editor}
          looks={looks}
          onClose={() => setEditor(null)}
          onUnauthorized={() => setAuthOpen(true)}
          onSaved={(book) => {
            replaceBook(book);
            setSelectedId(book.id);
            setEditor(null);
            setNotice(
              editor === "new"
                ? "Đã tạo lookbook riêng tư. Thêm bộ phối để bắt đầu câu chuyện."
                : "Đã lưu tên, bìa và thứ tự bộ phối.",
            );
          }}
        />
      )}
      {renaming && (
        <RenameLook
          key={renaming.id}
          look={renaming}
          onClose={() => setRenaming(null)}
          onUnauthorized={() => setAuthOpen(true)}
          onSaved={(look) => {
            replaceLook(look);
            setRenaming(null);
            setNotice("Đã đổi tên bộ phối trong mọi lookbook và link đang chia sẻ.");
          }}
        />
      )}
      {adding && (
        <AddToBook
          key={adding.id}
          look={adding}
          books={books}
          onClose={() => setAdding(null)}
          onCreate={() => {
            setAdding(null);
            setEditor("new");
          }}
          onUnauthorized={() => setAuthOpen(true)}
          onSaved={(book) => {
            replaceBook(book);
            setAdding(null);
            setNotice(
              `Đã thêm bộ phối vào “${book.name}”.${book.shareToken ? " Người có link lookbook này cũng xem được bộ phối vừa thêm." : ""}`,
            );
          }}
        />
      )}
      {sharing && (
        <ShareDialog
          open
          onClose={() => setSharing(null)}
          kind={sharing.kind}
          targetId={sharing.id}
          name={sharing.name}
          initialToken={sharing.token}
          onChanged={shared}
        />
      )}
      <Dialog
        open={!!deleting}
        onClose={() => {
          if (!busyId) setDeleting(null);
        }}
        title={deleting?.kind === "look" ? "Xóa bộ phối này?" : "Xóa lookbook này?"}
      >
        <div className="form-stack">
          <p style={{ fontSize: 12 }}>
            Bạn sắp xóa <strong>{deleting?.name}</strong>.
          </p>
          {deleting?.kind === "look" ? (
            <>
              <p className="text-muted" style={{ fontSize: 11 }}>
                Bộ phối sẽ bị xóa vĩnh viễn, link riêng hết hiệu lực và bộ phối được gỡ khỏi mọi
                lookbook của bạn. Bản sao người khác đã lưu vẫn giữ nguyên.
              </p>
              {affectedBooks.length > 0 && (
                <p className="notice">
                  Sẽ gỡ khỏi: {affectedBooks.map((book) => book.name).join(", ")}.
                </p>
              )}
            </>
          ) : (
            <p className="text-muted" style={{ fontSize: 11 }}>
              Lookbook và link chia sẻ của nó sẽ bị xóa. Các bộ phối bên trong vẫn được giữ ở mục Bộ
              phối đã lưu.
            </p>
          )}
          {deleteError && (
            <p className="notice notice-error" role="alert">
              {deleteError}
            </p>
          )}
          <div className="row wrap">
            <button
              className="button button-danger"
              disabled={!!busyId}
              onClick={() => void remove()}
            >
              {busyId ? <LoaderCircle className="spin" size={16} /> : <Trash2 size={16} />}Xác nhận
              xóa
            </button>
            <button
              className="button button-secondary"
              disabled={!!busyId}
              onClick={() => setDeleting(null)}
            >
              Giữ lại
            </button>
          </div>
        </div>
      </Dialog>
      <AuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          setAuthOpen(false);
          void refresh();
        }}
      />
    </>
  );
}

function BookEditor({
  book,
  looks,
  onClose,
  onSaved,
  onUnauthorized,
}: {
  book: Lookbook | null;
  looks: SavedLook[];
  onClose: () => void;
  onSaved: (book: Lookbook) => void;
  onUnauthorized: () => void;
}) {
  const [name, setName] = useState(book?.name ?? "");
  const [description, setDescription] = useState(book?.description ?? "");
  const [ids, setIds] = useState(book?.looks.map((look) => look.id) ?? []);
  const [coverId, setCoverId] = useState<string | null>(book?.coverLookId ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  function toggle(id: string) {
    if (ids.includes(id)) {
      setIds(ids.filter((item) => item !== id));
      if (coverId === id) setCoverId(null);
    } else if (ids.length < 100) setIds([...ids, id]);
    else setError("Mỗi lookbook chứa tối đa 100 bộ phối.");
  }
  function move(index: number, direction: number) {
    const next = [...ids];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    setIds(next);
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const { lookbook } = await api<{ lookbook: Lookbook }>(
        book ? `/api/lookbooks/${book.id}` : "/api/lookbooks",
        {
          method: book ? "PATCH" : "POST",
          body: JSON.stringify(
            book
              ? {
                  name: name.trim(),
                  description: description.trim(),
                  lookIds: ids,
                  coverLookId: coverId,
                }
              : { name: name.trim(), description: description.trim() },
          ),
        },
      );
      onSaved(lookbook);
    } catch (cause) {
      setError(errorText(cause));
      if (cause instanceof ApiError && cause.status === 401) onUnauthorized();
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open
      onClose={() => {
        if (!busy) onClose();
      }}
      title={book ? "Sắp xếp câu chuyện của bạn." : "Đặt tên một câu chuyện mới."}
      wide={!!book}
    >
      <form className="form-stack" onSubmit={submit}>
        <label className="field">
          Tên lookbook
          <input
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ví dụ: Một ngày ở Huế"
            disabled={busy}
          />
        </label>
        <label className="field">
          Đôi lời về lookbook
          <textarea
            maxLength={500}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Cảm hứng, dịp đặc biệt hay một chút tâm trạng…"
            disabled={busy}
          />
        </label>
        {book ? (
          <>
            {book.shareToken && (
              <p className="notice notice-info">
                Lookbook đang chia sẻ. Tất cả bộ phối bạn thêm sẽ xuất hiện qua link, kể cả bộ đang
                tắt link riêng.
              </p>
            )}
            <div className="field">
              <span>Chọn bộ phối · {ids.length}/100</span>
              {looks.length ? (
                <div className="check-list">
                  {looks.map((look) => (
                    <label
                      key={look.id}
                      className={`look-checkbox ${ids.includes(look.id) ? "selected" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={ids.includes(look.id)}
                        onChange={() => toggle(look.id)}
                        disabled={busy}
                      />
                      <OutfitFigure config={look.config} />
                      <span style={{ overflowWrap: "anywhere" }}>{look.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="notice">
                  Bạn chưa có bộ phối nào. Lưu một bộ trong phòng phối rồi quay lại để thêm nhé.
                </p>
              )}
            </div>
            {ids.length > 0 && (
              <>
                <div className="field">
                  <span>Thứ tự trong lookbook</span>
                  <div className="order-list">
                    {ids.map((id, index) => (
                      <div className="order-item" key={id}>
                        <span>
                          {index + 1}.{" "}
                          {looks.find((look) => look.id === id)?.name ??
                            "Bộ phối không còn khả dụng"}
                        </span>
                        <button
                          type="button"
                          className="icon-button"
                          disabled={busy || index === 0}
                          onClick={() => move(index, -1)}
                          aria-label={`Chuyển bộ phối ${index + 1} lên`}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          disabled={busy || index === ids.length - 1}
                          onClick={() => move(index, 1)}
                          aria-label={`Chuyển bộ phối ${index + 1} xuống`}
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          disabled={busy}
                          onClick={() => toggle(id)}
                          aria-label={`Gỡ bộ phối ${index + 1} khỏi lookbook`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <label className="field">
                  Bộ phối làm ảnh bìa
                  <select
                    value={coverId ?? ""}
                    onChange={(event) => setCoverId(event.target.value || null)}
                    disabled={busy}
                  >
                    <option value="">Dùng bộ phối đầu tiên</option>
                    {ids.map((id) => (
                      <option value={id} key={id}>
                        {looks.find((look) => look.id === id)?.name ?? "Bộ phối không còn khả dụng"}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
          </>
        ) : (
          <p className="notice row">
            <LockKeyhole size={17} style={{ flexShrink: 0 }} />
            <span>
              Lookbook mới được lưu riêng tư. Sau khi tạo, bạn có thể chọn bộ phối, sắp xếp và đặt
              ảnh bìa.
            </span>
          </p>
        )}
        {error && (
          <p className="notice notice-error" role="alert">
            {error}
          </p>
        )}
        <div className="row wrap">
          <button type="submit" className="button button-primary" disabled={busy || !name.trim()}>
            {busy ? <LoaderCircle className="spin" size={16} /> : <Check size={16} />}
            {book ? "Lưu thay đổi" : "Tạo lookbook"}
          </button>
          <button
            type="button"
            className="button button-secondary"
            onClick={onClose}
            disabled={busy}
          >
            Để sau
          </button>
        </div>
      </form>
    </Dialog>
  );
}

function RenameLook({
  look: initial,
  onClose,
  onSaved,
  onUnauthorized,
}: {
  look: SavedLook;
  onClose: () => void;
  onSaved: (look: SavedLook) => void;
  onUnauthorized: () => void;
}) {
  const [look, setLook] = useState(initial);
  const [name, setName] = useState(initial.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || conflict) return;
    setBusy(true);
    setError("");
    try {
      const result = await api<{ look: SavedLook }>(`/api/looks/${look.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: name.trim(), config: look.config, revision: look.revision }),
      });
      onSaved(result.look);
    } catch (cause) {
      setError(errorText(cause));
      if (cause instanceof ApiError && cause.status === 409) setConflict(true);
      if (cause instanceof ApiError && cause.status === 401) onUnauthorized();
    } finally {
      setBusy(false);
    }
  }
  async function latest() {
    setBusy(true);
    setError("");
    try {
      const result = await api<{ look: SavedLook }>(`/api/looks/${look.id}`);
      setLook(result.look);
      setConflict(false);
    } catch (cause) {
      setError(errorText(cause));
      if (cause instanceof ApiError && cause.status === 401) onUnauthorized();
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open
      onClose={() => {
        if (!busy) onClose();
      }}
      title="Một cái tên thật hợp gu."
    >
      <form className="form-stack" onSubmit={submit}>
        <label className="field">
          Tên bộ phối
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={100}
            disabled={busy}
          />
        </label>
        <p className="text-muted" style={{ fontSize: 11 }}>
          Tên mới sẽ xuất hiện trong mọi lookbook và link đang chia sẻ bộ phối này.
        </p>
        {conflict && (
          <div className="notice stack">
            <p>
              Bộ phối đã được sửa ở nơi khác. Tải phiên bản mới trước khi đổi tên để giữ các thay
              đổi đó.
            </p>
            <button
              type="button"
              className="button button-secondary button-small"
              disabled={busy}
              onClick={() => void latest()}
            >
              <RefreshCw size={14} />
              Tải phiên bản mới, giữ tên vừa nhập
            </button>
          </div>
        )}
        {error && (
          <p className="notice notice-error" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="button button-primary"
          disabled={busy || conflict || !name.trim()}
        >
          {busy ? <LoaderCircle className="spin" size={16} /> : <Check size={16} />}Lưu tên mới
        </button>
      </form>
    </Dialog>
  );
}

function AddToBook({
  look,
  books,
  onClose,
  onCreate,
  onSaved,
  onUnauthorized,
}: {
  look: SavedLook;
  books: Lookbook[];
  onClose: () => void;
  onCreate: () => void;
  onSaved: (book: Lookbook) => void;
  onUnauthorized: () => void;
}) {
  const candidates = books.filter(
    (book) => !book.looks.some((item) => item.id === look.id) && book.looks.length < 100,
  );
  const [bookId, setBookId] = useState(candidates[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const selected = books.find((book) => book.id === bookId);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selected || busy) return;
    setBusy(true);
    setError("");
    try {
      // Read the current order immediately before appending so another tab's edits are retained.
      const current = await api<{ lookbooks: Lookbook[] }>("/api/lookbooks");
      const latest = current.lookbooks.find((book) => book.id === bookId);
      if (!latest)
        throw new Error("Lookbook này không còn tồn tại. Hãy đóng cửa sổ và tải lại thư viện.");
      const nextIds = latest.looks.some((item) => item.id === look.id)
        ? latest.looks.map((item) => item.id)
        : [...latest.looks.map((item) => item.id), look.id];
      const { lookbook } = await api<{ lookbook: Lookbook }>(`/api/lookbooks/${bookId}`, {
        method: "PATCH",
        body: JSON.stringify({ lookIds: nextIds }),
      });
      onSaved(lookbook);
    } catch (cause) {
      setError(errorText(cause));
      if (cause instanceof ApiError && cause.status === 401) onUnauthorized();
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open
      onClose={() => {
        if (!busy) onClose();
      }}
      title="Thêm một mảnh vào câu chuyện."
    >
      <form onSubmit={submit} className="form-stack">
        <p className="text-muted" style={{ fontSize: 12 }}>
          Chọn lookbook cho <strong>{look.name}</strong>. Một bộ phối có thể xuất hiện trong nhiều
          lookbook.
        </p>
        {candidates.length ? (
          <>
            <label className="field">
              Lookbook
              <select
                value={bookId}
                onChange={(event) => setBookId(event.target.value)}
                disabled={busy}
              >
                {candidates.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.name} · {book.looks.length} bộ{book.shareToken ? " · Đang chia sẻ" : ""}
                  </option>
                ))}
              </select>
            </label>
            {selected?.shareToken && (
              <p className="notice notice-info">
                Lookbook đang chia sẻ. Người có link sẽ xem được bộ phối vừa thêm, kể cả khi link
                riêng của bộ phối đang tắt.
              </p>
            )}
            <button className="button button-primary" disabled={busy || !selected}>
              {busy ? <LoaderCircle size={16} className="spin" /> : <FolderPlus size={16} />}Thêm
              vào lookbook
            </button>
          </>
        ) : (
          <p className="notice">
            {books.length
              ? "Bộ phối đã có trong các lookbook hiện tại, hoặc lookbook đã đủ 100 bộ."
              : "Bạn chưa có lookbook nào. Tạo một lookbook trước rồi chọn những bộ phối muốn thêm."}
          </p>
        )}
        {error && (
          <p className="notice notice-error" role="alert">
            {error}
          </p>
        )}
        <button type="button" className="text-link" disabled={busy} onClick={onCreate}>
          <ImagePlus size={16} />
          Tạo một lookbook mới
        </button>
      </form>
    </Dialog>
  );
}
