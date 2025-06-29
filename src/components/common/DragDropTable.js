import React, { useState } from 'react';
import { Table, message } from 'antd';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MenuOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

// Sortable Row Component
const SortableRow = ({ children, ...props }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: props['data-row-key'],
    });

    const style = {
        ...props.style,
        transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
        transition,
        ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
    };

    return (
        <tr {...props} ref={setNodeRef} style={style} {...attributes}>
            {React.Children.map(children, (child, index) => {
                if (index === 0) {
                    return React.cloneElement(child, {
                        children: (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MenuOutlined
                                    {...listeners}
                                    style={{
                                        cursor: 'grab',
                                        color: '#999',
                                        fontSize: '14px'
                                    }}
                                />
                                {child.props.children}
                            </div>
                        ),
                    });
                }
                return child;
            })}
        </tr>
    );
};

// Main Drag-Drop Table Component
const DragDropTable = ({
    dataSource,
    columns,
    onReorder,
    loading = false,
    rowKey = 'id',
    ...tableProps
}) => {
    const [data, setData] = useState(dataSource);

    // Update data when dataSource prop changes
    React.useEffect(() => {
        setData(dataSource);
    }, [dataSource]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = data.findIndex((item) => item[rowKey] === active.id);
            const newIndex = data.findIndex((item) => item[rowKey] === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newData = arrayMove(data, oldIndex, newIndex);

                // Update local state immediately for better UX
                setData(newData);

                // Create reorder items with new sort values
                const reorderItems = newData.map((item, index) => ({
                    categoryId: item[rowKey],
                    newSort: index + 1
                }));

                try {
                    // Call parent reorder function
                    if (onReorder) {
                        await onReorder(reorderItems, newData);
                    }
                    message.success('Đã cập nhật thứ tự danh mục!');
                } catch (error) {
                    // Revert on error
                    setData(dataSource);
                    message.error('Không thể cập nhật thứ tự: ' + error.message);
                }
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
        >
            <SortableContext items={data.map(item => item[rowKey])} strategy={verticalListSortingStrategy}>
                <Table
                    {...tableProps}
                    dataSource={data}
                    columns={columns}
                    rowKey={rowKey}
                    loading={loading}
                    components={{
                        body: {
                            row: SortableRow,
                        },
                    }}
                />
            </SortableContext>
        </DndContext>
    );
};

DragDropTable.propTypes = {
    dataSource: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    onReorder: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    rowKey: PropTypes.string,
};

export default DragDropTable; 